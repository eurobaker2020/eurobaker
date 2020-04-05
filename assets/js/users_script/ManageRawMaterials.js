$(document).ready(function () {
    var base_url = $('.base_url').val();

    $('#myTable').DataTable();

    var table_raw_materials = $('#raw_Materials').DataTable({
         "language": { "infoFiltered": "" },
         "processing": true, //Feature control the processing indicator.
         "serverSide": true, //Feature control DataTables' server-side processing mode.
         "responsive": true,
         "order": [[0,'desc']], //Initial no order.
         "columns":[
              {"data": "PK_raw_materials_id","render":function(data, type, row, meta){
                   var str = 'RM-'+row.PK_raw_materials_id;
                   return str;
                   }
              },
              {"data":"category_name"},
              {"data":"material_name"},
              {"data":"unit"},
              {"data": "PK_raw_materials_id","render":function(data, type, row, meta){
                   var str = parseFloat(row.average_cost).toFixed(2);
                   return str;
                   }
              },
              {"data": "PK_raw_materials_id","render":function(data, type, row, meta){
                   var str = parseFloat(row.sales_price).toFixed(2);
                   return str;
                   }
              },
              {"data":"PK_raw_materials_id","render":function(data, type, row, meta){
                   var str = '<div class="action-btn-div"><a href="javascript:;" id="edit_Details" data-id="' + row.PK_raw_materials_id +'"><i class="fa fa-edit"></i></a>';
                   str += '<a href="javascript:;" id="view_Details" class="text-success"  data-id="' + row.PK_raw_materials_id +'"><i class="fa fa-eye"></i></a></div>';
                   return str;
               }
              },
         ],
         "ajax": {
              "url": base_url+"manageRawMaterials/getRawMaterials",
              "type": "POST"
         },
         "columnDefs": [
              {
                   "targets": [6],
                   "orderable": false,
               },
          ],
    });

    $(document).on('submit','#Raw_Material_Add', function(e) {
         e.preventDefault();
         var formData = new FormData($(this)[0]);

         $.ajax({
              url         : base_url + 'manageRawMaterials/addRawMaterial',
              data        : formData,
              processData : false,
              contentType : false,
              cache       : false,
              type        : 'POST',
              success     : function(data){
                            table_raw_materials.ajax.reload();
                            $('.add_raw_material_modal').modal('hide');
              }
         });
    });

    $(document).on('click', '#view_Details', function() {
        var id = $(this).data('id');
        $('.view_details_modal').modal('show');
        $('.view_details_modal input').prop('disabled', true);

        $.ajax({
             url      :  base_url + 'manageRawMaterials/viewDetails',
             type     :  "post",
             data     :  {  "id"  : id  },
             dataType :  'json',
             success  :  function(data){
                          $('.view_details_modal input[name="material_name"]').val(data.material_name);
                          $('.view_details_modal input[name="category"]').val(data.category_name);
                          $('.view_details_modal input[name="unit"]').val(data.unit);
                          $('.view_details_modal input[name="average_cost"]').val(data.average_cost);
                          $('.view_details_modal input[name="sales_price"]').val(data.sales_price);
             }
        });
    });

    $(document).on('click', '#edit_Details', function() {
        var id = $(this).data('id');
        $('.edit_details_modal').modal('show');

        $.ajax({
             url      :  base_url + 'manageRawMaterials/viewDetails',
             type     :  "post",
             data     :  {  "id"  : id  },
             dataType :  'json',
             success  :  function(data){
                          $('.edit_details_modal input[name="material_name"]').val(data.material_name);
                          $('.edit_details_modal select[name="category"]').val(data.FK_category_id).trigger('change');
                          $('.edit_details_modal input[name="unit"]').val(data.unit);
                          $('.edit_details_modal input[name="average_cost"]').val(data.average_cost);
                          $('.edit_details_modal input[name="sales_price"]').val(data.sales_price);
                          $('.edit_details_modal .edit_Button').attr('data-id', data.PK_raw_materials_id);
             }
        });
    });

    $(document).on('submit','#Raw_Material_Edit', function(e) {
         e.preventDefault();
         var formData = new FormData($(this)[0]);
         var dataid   = $('.edit_details_modal .edit_Button').data('id');
         formData.append('id', dataid)

         $.ajax({
              url         : base_url + 'manageRawMaterials/updateDetails',
              data        : formData,
              processData : false,
              contentType : false,
              cache       : false,
              type        : 'POST',
              success     : function(data){
                            table_raw_materials.ajax.reload();
                            $('.edit_details_modal').modal('hide');
              }
         });
    });
})
