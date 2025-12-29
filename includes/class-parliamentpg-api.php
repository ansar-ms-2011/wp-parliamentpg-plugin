<?php
class Parliament_PG_API {
	public function register_routes() {
		register_rest_route('parliament-pg/v1', '/external-data', array(
			'methods'  => 'GET',
			'callback' => array($this, 'get_remote_data'),
			'permission_callback' => '__return_true', // Adjust for security if needed
		));
	}

	public function get_remote_data() {
		// The external URL you want to fetch from
		$external_url = 'http://crts.test/api/v1/bills';

		$response = wp_remote_get($external_url);

		if (is_wp_error($response)) {
			return new WP_Error('no_data', 'Unable to fetch data', array('status' => 404));
		}

		$body = wp_remote_retrieve_body($response);

		$data = json_decode($body, true);

		// Return as proper JSON response
		wp_send_json($data);
	}
}
