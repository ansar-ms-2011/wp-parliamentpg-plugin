<?php
class Parliament_PG_API_Press_Releases {
	public function register_route_press_releases() {
		register_rest_route('parliament-pg/v1', '/get-press-releases', array(
			'methods'  => 'GET',
			'callback' => array($this, 'get_press_releases_data'),
			'permission_callback' => '__return_true',
			'args' => array(
				'aId' => array(
					'sanitize_callback' => 'absint',
				),
			),
		));
	}

	public function get_press_releases_data( WP_REST_Request $request ) {
		$endpoints = get_option( 'parliament_pg_view_endpoints', [] );
		$query = [];
		// Optional filters
		foreach (['year', 'month','page'] as $param) {
			$value = $request->get_param($param);
			if ($value !== null && $value !== '') {
				$query[$param] = $value;
			}
		}

		$external_url = add_query_arg( $query, $endpoints['press-releases']['backend']);

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
