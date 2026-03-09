<?php
class Parliament_PG_API_Sessions {
	public function register_route_sessions() {
		register_rest_route('parliament-pg/v1', '/get-sessions', array(
			'methods'  => 'GET',
			'callback' => array($this, 'get_sessions_data'),
			'permission_callback' => '__return_true',
			'args' => array(
				'aId' => array(
					'sanitize_callback' => 'absint',
				),
			),
		));
	}

	public function get_sessions_data( WP_REST_Request $request ) {
		$endpoints = get_option( 'parliament_pg_view_endpoints', [] );
		$query = [];
		// Optional filters
		foreach (['year', 'month'] as $param) {
			$value = $request->get_param($param);
			if ($value !== null && $value !== '') {
				$query[$param] = $value;
			}
		}

		$external_url = add_query_arg( $query, $endpoints['month-sessions']['backend']);

		$response = wp_remote_get($external_url);

		if (is_wp_error($response)) {
			return new WP_Error(
				'backend_api_error',
				$response->get_error_message(),
				['status' => 500]
			);
		}

		$body = wp_remote_retrieve_body($response, ['sslverify' => false]);
		$data = json_decode($body, true);
		if ($data === null) {
			parliament_pg_log("JSON decode failed — error: " . json_last_error_msg());
		}

		return rest_ensure_response($data);
	}
}
