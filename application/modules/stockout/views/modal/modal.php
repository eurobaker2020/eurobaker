<div class="modal fade add_so_modal" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-lg" style="max-width:900px;">
                            <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Request Form</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <form id="Purchase_Order_Add" action="#" method="POST">
                                        <div class="form-body">
                                            <div class="card-body">	
                                            <div class="row">
                                                <div class="col-md-4">
                                                    <label class="fbold" for="supplier">Select Segment</label>
                                                    <select name="segment_id" class="supplier_select form-control" style="width: 100%;">
                                                        <optgroup label="Select Segment">
                                                            <?php
                                                                foreach ($segments as $seg) {
                                                                    echo "<option value='{$seg->PK_segment_id}' >{$seg->segment_name}</option>";
                                                                }
                                                            ?> 
                                                        </optgroup>
                                                </select>
                                                </div>
                                                <div class="col-md-12"> <hr> </div>
                                            </div>
                                            <div class="cont-po">

                                                <table class="table table-bordered po-table">
                                                    <thead>
                                                        <tr>
                                                            <td>Item Name</td>
                                                            <td>Quantity</td>
                                                            <td style="width: 122px;">Item Unit</td>
                                                            <td >Price</td>
                                                            <td >Total</td>
                                                            <td>Action</td>
                                                        </tr>
                                                    </thead>
                                                    <tbody class="table-po-body"> </tbody>
                                                </table>
                                            <div class="row">
                                                    <div class="col-md-12 text-center">
                                                        <button type="button" class="btn btn-default btn-add-item"><i class="fa fa-plus"></i> Add More Item</button>
                                                        
                                                    </div>
                                            </div>
                                                <div class="form-actions">
                                                    <hr/>
                                                    <h3 class="fbold o-total">Total Items: <span class="total-item">0</span></h3>
                                                    
                                                    <h3 class="fbold o-total">Overall Total: <span>&#8369;</span><span class="over-total">0</span></h3>
                                                    <hr>
                                                    <div class="card-body text-right ">
                                                        <button type="submit" class="btn btn-success"> Submit </button>
                                                    </div>
                                                </div>
                                            </div>
                                            </div>
                                    </form>
                            </div>
                            </div>
                        </div>
                        </div>
                </div>