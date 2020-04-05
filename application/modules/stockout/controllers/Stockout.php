<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Stockout extends MY_Controller {
		public function __construct() {
				parent::__construct();
		}

		public function index(){
			$data["title"] 		  	= "Stock Out";
			$data["page_name"]  = "Stock Out";
			$data['has_header'] = "includes/admin/header";
			$data['has_modal'] = "modal/modal";
			$data['has_footer']	= "includes/index_footer";

			$par["select"] = "*";
			$par["where"] = array(
				"FK_branch_id" => _get_branch_assigned(),
				"status" => 1,
			);

			$segment = getData("eb_segment", $par, "obj");
			
			$data["segments"] = $segment;

			$this->load_page('index',$data);
		}

		public function get_stockout_data(){
			$limit        = $this->input->post('length');
			$offset       = $this->input->post('start');
			$search       = $this->input->post('search');
			$order        = $this->input->post('order');
			$draw         = $this->input->post('draw');
			
			$column_order = array(
				'so.PK_stock_out_id',
				'seg.segment_name',
				'so.total_items',
				'so.total_amount',
				'user.firstname',
				'so.status',
				'so.date_added',
			);

			$join         = array(
				"eb_segment seg" => "so.FK_segment_id = seg.PK_segment_id",
				"eb_users_meta user" => "user.FK_user_id = so.FK_user_id",
			);
			$select       = "so.PK_stock_out_id, seg.segment_name, so.total_items, so.total_amount, user.firstname, so.status, so.date_added";
			$where        = array(
				'so.FK_segment_id'  => 1,
			);
			$group        = array();
			$list         = getDataTables('eb_stock_out so',$column_order, $select, $where, $join, $limit, $offset ,$search, $order, $group);
			
			$list_purchase_order = array(
				"draw" => $draw,
				"recordsTotal" => $list['count_all'],
				"recordsFiltered" => $list['count'],
				"data" => $list['data']
			);

			echo json_encode($list_purchase_order);
		}


}
