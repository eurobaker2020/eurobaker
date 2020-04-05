$(document).ready(function() {
	// var purchase_orders = $('#purchase_Orders').DataTable();
	var base_url = $('.base_url').val();

	$(".select2").select2();
	
	let items = [];

	let is_add_item = false;

	axios.get(`${base_url}global_api/get_items`).then(res => {
		//  suppliers = JSON.parse(res.data.data);
		items = res.data.data;
	})

	$(".show-add-modal").click(function () {
		$(".add_po_modal").modal();
		$(".btn-add-item").trigger("click")
		$(".table-po-body").html("");
		$(".supplier_select").select2();
		is_add_item = true;
		$(".total-item").html(0)
		$(".over-total").html(0)
		
	})

	var table_purchase_order = $('#purchase_Orders').DataTable({
		"language": { "infoFiltered": "" },
		"processing": true, //Feature control the processing indicator.
		"serverSide": true, //Feature control DataTables' server-side processing mode.
		"responsive": true,
		"order": [[0, 'desc']], //Initial no order.
		"createdRow": function (row, data, dataIndex) {
			if (data.status == "received") {
				$(row).addClass("row_po_received");
			}
		},
		"columns": [
			{
				"data": "PK_purchase_order_id", "render": function (data, type, row, meta) {
					var str = 'PO-' + row.PK_purchase_order_id;
					return str;
				}
			},
			{ "data": "outlet_name" },
			{ "data": "supplier_name" },
			{
				"data": "status", "render": function (data, type, row, meta) {

					if (row.status == "pending") {
						return "<em class='po-stats'>Pending</em>"
					} 
					return "<em class='po-stats'>Received</em>"
				}
			},
			{
				"data": "total_amount", "render": function (data, type, row, meta) {
					var str = 'P' + row.total_amount;
					return str;
				}
			},
			{ "data": "date_added" },
			{
				"data": "PK_purchase_order_id", "render": function (data, type, row, meta) {
					var str = '<div class="mx-auto action-btn-div"> <a href="javascript:;" class="edit-btn btn_edit_po" data-id="' + row.PK_purchase_order_id + '"><i class="fa fa-edit"></i></a>';
					str += '<a href="javascript:;" id="view_Supplier_Details" class="po_recieved-btn text-success" data-id="' + row.PK_purchase_order_id + '" title="Receive"><i class="fa fa-check"></i></a></div>';

					if (row.status == "received") {
						str = '<div class="mx-auto action-btn-div">';
						str += '<a href="javascript:;" class="po_view_received text-success" data-id="' + row.PK_purchase_order_id + '" title="view"><i class="fa fa-eye"></i></a></div>';
					}
					return str;
				}
			},
		],
		"ajax": {
			"url": base_url + "ManagePurchaseOrders/getPurchaseOrder",
			"type": "POST"
		},
		"columnDefs": [
			{
				"targets": [3],
				"orderable": false,
			},
		],
	});
	

	$(".btn-add-item").click(function () {
		
		let options = "<option  value=''>Please select an item<option>";
		items.map(item => {
			options += `<option data-id="${item.PK_raw_materials_id}" value="${item.material_name}">${item.material_name}<option>`;
		})

		let html = `
			<tr>
				<td>
					<select required class="itemselect form-control" style="width: 100%;">
						<optgroup label="Select an item">
							${options}
						</optgroup>
					</select>
				</td>
			<td>
					<input type="number"  class="form-control item-qty" name="" min="1" value="1">
			</td>
			<td>
				<select name="unit" class="form-control item-unit" required">
					<option value="Sack">Sack</option>
					<option value="Sack">klg</option>
				</select>
			</td>
			<td>
				<input required readonly type="text" class="form-control item-price">
			</td>
			<td>
				<input required readonly type="text" class="form-control item-total">
			</td>
			<td>
				<a style="font-size:16px;" href="javascript:;" class="mx-auto fa fa-trash text-danger remove-po-item"></a>
			</td>
				
			</tr>
		`
	
		if (is_add_item) {
			$(".table-po-body").append(html);
		}
		else {
			$(".table-po-body-edit").append(html)
		}
		$(".itemselect").select2();
	})
	
	$(document).on("change", ".itemselect", function () {
		
		var elm 	= $("option:selected", this);
		let item_id = elm.attr("data-id");

		let item = items.find(itm => itm.PK_raw_materials_id == item_id);
		
		let row = $(this).closest('tr');
		if (is_item_exist(item_id)) {
			s_alert("This item is already added!", "error")
			row.remove()
			return;
		}
		let qty 	= row.find(".item-qty").val()
		let total 	= calculateTotal(item.sales_price, qty)
		
		row.find(".item-price").val(item.sales_price)
		row.find(".item-total").val(total)

		generateOverTotal();
	})

	$(document).on("click", ".remove-po-item", function () {
		let row = $(this).closest('tr');
		row.remove();
		generateOverTotal();
	})

	$(document).on("change", ".item-qty", function () {

		let qty 		= Number($(this).val())
		let row 		= $(this).closest('tr');
		let selected 	= row.find(".itemselect option:selected");
		let item_id 	= selected.attr("data-id")
		let item 		= items.find(itm => itm.PK_raw_materials_id == item_id);

		let total 	= calculateTotal(item.sales_price, qty)
		
		row.find(".item-total").val(total)

		generateOverTotal();
	})

	// 
	$("#Purchase_Order_Add").submit(function (e) {
		e.preventDefault();
		let overTotal = $(".over-total").html();
		let supplier_id = $(".supplier_select option:selected").val()

		if (Number(overTotal) == 0) {
			s_alert("Please add atleast one item", "error")
			return
		}
		else if (!validated_table()) {
			s_alert("Please input the required items", "error")
			return
		}
		else if (supplier_id == 0 || supplier_id == undefined) {
			s_alert("Please select a supplier first", "error")
			return
		}

		confirm_alert("Are you sure to save this Purchase Order?").then(res => {
			let frmdata = new FormData();
			
			let po_items = [];
			let total_items = $(".total-item").html();
			let over_total = $(".over-total").html();

			$(".table-po-body tr").each(function () {
				let row 		= $(this);
				let item_ids 	= row.find(".itemselect option:selected").attr("data-id")
				po_items.push({
					item_id: item_ids,
					quantity: row.find(".item-qty").val(),
					unit: row.find(".item-unit").val(),
				})
			})

			frmdata.append("supplier_id", 	supplier_id);
			frmdata.append("over_total", 	over_total);
			frmdata.append("total_items", 	total_items);
			frmdata.append("po_items",		JSON.stringify(po_items));
			
			axios.post(`${base_url}ManagePurchaseOrders/save_purchase_order`, frmdata).then(res => {
				if (res.data.result == "success") {
					s_alert("Successfully Saved!", "success");
					table_purchase_order.ajax.reload();
					setTimeout(() => { $('.add_po_modal').modal('hide'); }, 1000);
				}
			})
		})
		
	})

	$("#Purchase_Order_edit_form").submit(function (e) {
		e.preventDefault();
		let overTotal 	= $(".over-total").html();
		let supplier_id = $(".supplier_select_edit  option:selected").val()
		let po_id 		= $(".po_edit_id").val();

		if (Number(overTotal) == 0) {
			s_alert("Please add atleast one item", "error")
			return
		}
		else if (!validated_table("edit")) {
			s_alert("Please input the required items", "error")
			return
		}
		else if (supplier_id == 0 || supplier_id == undefined) {
			s_alert("Please select a supplier first", "error")
			return
		}

		confirm_alert("Are you sure to update this Purchase Order?").then(res => {
			let frmdata = new FormData();

			let po_items = [];
			let total_items = $(".total-item").html();
			let over_total = $(".over-total").html();

			$(".table-po-body-edit tr").each(function () {
				let row = $(this);
				let item_ids = row.find(".itemselect option:selected").attr("data-id")
				po_items.push({
					item_id: item_ids,
					quantity: row.find(".item-qty").val(),
					unit: row.find(".item-unit").val(),
				})
			})

			frmdata.append("supplier_id", supplier_id);
			frmdata.append("po_id", po_id);
			frmdata.append("over_total", over_total);
			frmdata.append("total_items", total_items);
			frmdata.append("po_items", JSON.stringify(po_items));

			axios.post(`${base_url}ManagePurchaseOrders/update_purchase_order`, frmdata).then(res => {
				if (res.data.result == "success") {
					s_alert("Successfully Updated!", "success");
					table_purchase_order.ajax.reload();
					setTimeout(() => { $('.edit_po_modal').modal('hide'); }, 1000);
				}
			})
		})
	})

	$(document).on("click",".po_recieved-btn", function(){
	
		let po_id = $(this).data("id");
		
		confirm_alert("Are you sure to recieve this purchase order?").then(res => {
			let frmdata = new FormData();
			frmdata.append("po_id", po_id);

			axios.post(`${base_url}ManagePurchaseOrders/receive_purchase_order`, frmdata).then(res => {
				if (res.data.result == "success") {
					s_alert("Received Successfully!", "success");
					table_purchase_order.ajax.reload();
				}
			})

		})
	})

	let get_po_data = [];

	$(document).on("click", ".po_view_received", function () {
		let po_id = $(this).data("id");

		axios.get(`${base_url}ManagePurchaseOrders/get_received_po_details/${po_id}`).then(res => {
			if (res.data.result == "success") {
				let result = res.data.data;
				get_po_data = res.data.data;
				$(".table-po-body-received").html("")
				$(".po_receive_supplier").html(result[0].supplier_name)
				$(".po_received_date").html(result[0].date_received)

				let po_items = result[0].po_items

				let gtotal = 0;
				
				po_items.map(po_item => {
					gtotal += Number(po_item.quantity) * Number(po_item.average_cost);
					let html = `
							<tr>
								<td>
									${po_item.material_name}
								</td>
							
								<td>
									${po_item.quantity}
								</td>
								<td>
									${po_item.item_unit}
								</td>
								<td>
									${po_item.average_cost}
								</td>
								<td>
									${(Number(po_item.quantity) * Number(po_item.average_cost)).toFixed(2)}
								</td>
									
							</tr>
						`
					$(".table-po-body-received").append(html);
				})
				$(".total-item-received").html(po_items.length)
				$(".over-total-received").html(gtotal)
			}
		})
		
		$(".view_received_modal").modal();

	})

	$(document).on("click",".btn_edit_po", function () {
		let po_id = $(this).data("id");
		is_add_item = false;
		$(".po_edit_id").val(po_id)
		axios.get(`${base_url}ManagePurchaseOrders/get_po_details/${po_id}`).then(res => {
			if (res.data.result == "success") {
				let datas = res.data.data;
				let po_items = datas[0].po_items
				$(".table-po-body-edit").html("")
		
				$(".supplier_select_edit option[value=" + datas[0].FK_supplier_id+"]").attr("selected", "selected").change()

				po_items.map(po_item => {

					let options = "<option  value=''>Please select an item<option>";

					items.map(item => {
						options += `<option ${po_item.FK_raw_material_id == item.PK_raw_materials_id ? 'selected' : ''} data-id="${item.PK_raw_materials_id}" value="${item.material_name}">${item.material_name}<option>`;
					})

					let html = `
							<tr>
								<td>
									<select required class="itemselect form-control" style="width: 100%;">
										<optgroup label="Select an item">
											${options}
										</optgroup>
									</select>
								</td>
							
							<td>
									<input type="number" value="${po_item.quantity}"  class="form-control item-qty" name="" min="1">
							</td>
							<td>
								<select name="unit" class="form-control item-unit" required">
									<option value="Sack">Sack</option>
									<option value="Sack">klg</option>
								</select>
							</td>
							<td>
								<input required readonly type="text" value="${po_item.average_cost}" class="form-control item-price">
							</td>
							<td>
								<input required readonly type="text" value="${Number(po_item.quantity) * Number(po_item.average_cost)}" class="form-control item-total">
							</td>
							<td>
								<a style="font-size:16px;" href="javascript:;" class="mx-auto fa fa-trash text-danger remove-po-item"></a>
							</td>
								
							</tr>
						`

					$(".table-po-body-edit").append(html);
					$(".itemselect").select2();
				})
				generateOverTotal()
			}
			$(".edit_po_modal").modal()
		})
	})

	$(".btn-generate-arf").click(function () {
		
		if (get_po_data.length != 0) {

			let po_items = get_po_data[0].po_items

			let gtotal = 0;
			let t_rows = "";
			po_items.map(po_item => {

				gtotal += Number(po_item.quantity) * Number(po_item.average_cost);
				t_rows += `
						<tr style="border-bottom:1px solid #222;">
							<td> ${po_item.material_name} </td>
							<td> ${po_item.quantity} </td>
							<td> ${po_item.item_unit} </td>
							<td> ${po_item.average_cost} </td>
							<td> <span style="font-weight:bold;"> ${(Number(po_item.quantity) * Number(po_item.average_cost)).toFixed(2)}</span> </td>
						</tr>
					`;
			})

			let html = `
				<div class="row">
					<div class="col-12" style="text-align:center; margin-bottom:25px">
						<figure style="width:200px;margin:0 auto;">
							<img src="${base_url}assets/img/logo-text.png" alt="" style="width:100%;">
						</figure>
						<h3>Euro Baker (Actual Received Form)</h3>
					</div>
					<table  style="width:100%;">
						<tr> <td style="padding:5px;font-weight:bold;" colspan="3">Purchase Order No: <span style="font-weight:normal">PO-${get_po_data[0].PK_purchase_order_id}</span></td> </tr>
						<tr> <td style="padding:5px;font-weight:bold;" colspan="3">Suppplier Name: ${get_po_data[0].supplier_name}</td> </tr>
						<tr > <td style="padding:5px;font-weight:bold;" colspan="3">Date Received: <span style="font-weight:normal">${get_po_data[0].date_received}</span></td> </tr>
						<tr> <td style="padding:5px;font-weight:bold; colspan="3">Received By: <span style="font-weight:normal">John Doe</span></td></tr>
					</table>
					<hr>
					<table style="width:100%;margin-top:20px;">
						<tr> <td>Item Name</td> <td>Quantity</td> <td>Item Unit</td> <td>Price</td> <td>Total</td> </tr>
						<tr> <td colspan="5"><hr></td> </tr>
						${t_rows}
					</table>
					<hr>
					<div style="margin-top:30px">Total Items: <span style="font-weight:bold">${po_items.length}</span></div>
					<div style="margin-top:15px">Total Amount: <span style="font-weight:bold">P${gtotal}</span></div>
				</div>
			`;
			$("#print_div").show().html(html);
			printJS('print_div', 'html')
			$("#print_div").html("");
		}
		
		
		
	})
	// $(".view_received_modal").modal()
	// $(".btn-generate-arf").trigger("click")

	function is_item_exist(item_id) {
		
		let count = 0;
		$(".itemselect").each(function (e, index) {
			var sel_value = $("option:selected", this).attr("data-id");
			if (item_id == sel_value) {
				count++;
			}
		})

		if (count == 2) {
			return true;
		}

		return false;
	}

	function validated_table(validate_type = "add") { 
		let resp = true;
		let form_id = "Purchase_Order_Add";

		if (validate_type != "add") {
			form_id = "Purchase_Order_edit_form"
		}

		$("#" + form_id+" .itemselect").each(function () {
			if ($(this).val() == "") {
				resp = false;
			}
		})
		$("#" + form_id +" .item-price").each(function () {
			if ($(this).val() == "") {
				resp = false;
			}
		})

		return resp;
	}

	// useful functions
	function calculateTotal(price, qty) {
		return Number(price) * Number(qty);
	}

	function generateOverTotal() {
		let over_total = 0;
		let count = 0;
		$(".add_po_modal .item-total").each(function (e) {
			over_total += Number($(this).val());
			count++;
		})
                                   
		$(".total-item").html(count)
		$(".over-total").html(over_total.toFixed(2))
	}





})


