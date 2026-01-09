<?php
class Parliament_PG_API_Hansards {
	public function register_route_hansards() {
		register_rest_route('parliament-pg/v1', '/get-hansards', array(
			'methods'  => 'GET',
			'callback' => array($this, 'get_hansards_data'),
			'permission_callback' => '__return_true',
			'args' => array(
				'page' => array(
					'validate_callback' => function( $value, $request, $param ) {
						return is_numeric( $value );
					},
					'sanitize_callback' => 'absint',
					'default' => 1,
				),
				'year' => array(
					'sanitize_callback' => 'sanitize_text_field',
				),
				'categoryId' => array(
					'sanitize_callback' => 'absint',
				),
				'statusId' => array(
					'sanitize_callback' => 'absint',
				),
				'proposerId' => array(
					'sanitize_callback' => 'absint',
				),
				'sortBy' => array(
					'sanitize_callback' => 'sanitize_text_field',
					'default' => 'desc',
				),
			),
		));
	}

	public function get_hansards_data( WP_REST_Request $request ) {
		$endpoints = get_option( 'parliament_pg_view_endpoints', [] );

		$query = array(
			'page'       => $request->get_param('page') ?: 1,
			'statusId'       => $request->get_param('statusId') ?: '',
			'categoryId'       => $request->get_param('categoryId') ?: '',
			'proposerId'       => $request->get_param('proposerId') ?: '',
			'sortBy'       => $request->get_param('sortBy') ?: '',
			'year'       => $request->get_param('year') ?: '',
		);

		// Optional filters
		foreach (['year', 'category_id', 'status_id', 'proposer_id', 'sortOrder'] as $param) {
			$value = $request->get_param($param);
			if ($value !== null && $value !== '') {
				$query[$param] = $value;
			}
		}

		$external_url = add_query_arg($query, $endpoints['hansards']['backend'] );

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
