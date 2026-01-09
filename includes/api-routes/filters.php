<?php
class Parliament_PG_API_Filters {
	public function register_route_filters() {
		register_rest_route('parliament-pg/v1', '/get-filters-data', array(
			'methods'  => 'GET',
			'callback' => array($this, 'get_filters_data'),
			'permission_callback' => '__return_true',
			'args' => array(
				'type' => array(
					'validate_callback' => function( $value ) {
						return in_array( $value, [
							'LEGISLATIVE_BILL',
							'PROCEEDING_MINUTES',
							'HANSARD',
							'NOTICE_PAPER'
						], true );
					},
					'sanitize_callback' => 'sanitize_text_field',
					'default' => 'LEGISLATIVE_BILL',
				),
			),
		));
	}

	public function get_filters_data(WP_REST_Request $request) {
		$endpoints = get_option( 'parliament_pg_view_endpoints', [] );

		$query = array(
			'type'       => $request->get_param('type') ?: 'LEGISLATIVE_BILL',
		);

		$external_url = add_query_arg( $query,	$endpoints['filters']['backend'] );

		$response = wp_remote_get($external_url);

		if (is_wp_error($response)) {
			return new WP_Error(
				'backend_api_error',
				$response->get_error_message(),
				['status' => 500]
			);
		}

		$body = wp_remote_retrieve_body($response);
		$data = json_decode($body, true);
		if ($data === null) {
			parliament_pg_log("JSON decode failed — error: " . json_last_error_msg());
		}

		return rest_ensure_response($data);
	}
}
