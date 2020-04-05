<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Global_api extends MY_Controller {
		public function __construct() {
				parent::__construct();
				
		}

		public function index(){
			
		}

		public function get_suppliers(){
			$response = array(
				"data" => _get_suppliers()
			);
			echo json_encode($response);
		}

		public function get_items(){
			$response = array(
				"data" => _get_items()
			);
			echo json_encode($response);
		}
		

}
