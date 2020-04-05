$(document).ready(function () {
    var base_url = $('.base_url').val();

    let items = [];

    let is_add_item = false;

    axios.get(`${base_url}global_api/get_items`).then(res => {
        //  suppliers = JSON.parse(res.data.data);
        items = res.data.data;
    })

    $(".show-add-modal").click(function () {
        $(".add_so_modal").modal();
        $(".btn-add-item").trigger("click")
        $(".table-po-body").html("");
        $(".supplier_select").select2();
        is_add_item = true;
        $(".total-item").html(0)
        $(".over-total").html(0)

    })

    var table_purchase_order = $('#stock_Out').DataTable({
        "language": { "infoFiltered": "" },
        "processing": true, //Feature control the processing indicator.
        "serverSide": true, //Feature control DataTables' server-side processing mode.
        "responsive": true,
        "order": [[0, 'desc']], //Initial no order.
        "createdRow": function (row, data, dataIndex) {
            if (data.status == "approved") {
                $(row).addClass("row_stock_received");
            }
        },
        "columns": [
            {
                "data": "PK_stock_out_id", "render": function (data, type, row, meta) {
                    var str = 'SO-' + row.PK_stock_out_id;
                    return str;
                }
            },
            { "data": "segment_name" },
            { "data": "total_items" },
            { "data": "total_amount" },
            { "data": "firstname" },
            { "data": "status" },
            { "data": "date_added" },
            {
                "data": "PK_stock_out_id", "render": function (data, type, row, meta) {
                    var str = '<div class="mx-auto action-btn-div"> <a href="javascript:;" class="edit-btn btn_edit_po" data-id="' + row.PK_stock_out_id + '"><i class="fa fa-edit"></i></a>';
                    str += '<a href="javascript:;" id="view_Supplier_Details" class="po_recieved-btn text-success" data-id="' + row.PK_stock_out_id + '" title="Receive"><i class="fa fa-check"></i></a></div>';

                    if (row.status == "approved") {
                        str = '<div class="mx-auto action-btn-div">';
                        str += '<a href="javascript:;" class="po_view_received text-success" data-id="' + row.PK_stock_out_id + '" title="view"><i class="fa fa-eye"></i></a></div>';
                    }
                    return str;
                }
            },
        ],
        "ajax": {
            "url": base_url + "stockout/get_stockout_data",
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

    $(document).on("click", ".remove-po-item", function () {
        let row = $(this).closest('tr');
        row.remove();
        generateOverTotal();
    })

    $(document).on("change", ".itemselect", function () {

        var elm = $("option:selected", this);
        let item_id = elm.attr("data-id");

        let item = items.find(itm => itm.PK_raw_materials_id == item_id);

        let row = $(this).closest('tr');
        if (is_item_exist(item_id)) {
            s_alert("This item is already added!", "error")
            row.remove()
            return;
        }
        let qty = row.find(".item-qty").val()
        let total = calculateTotal(item.sales_price, qty)

        row.find(".item-price").val(item.sales_price)
        row.find(".item-total").val(total)

        generateOverTotal();
    })

})