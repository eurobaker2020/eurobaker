<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Home extends MY_Controller {

		public function index(){
			
			redirect(base_url("ManagePurchaseOrders"));

			$data["title"] 		="Home";
			$data["page_name"]  ="home";
			$data['has_header'] ="includes/admin/header";
			$data['has_footer']	="includes/index_footer";
			$this->load_page('index',$data);

		}

}
