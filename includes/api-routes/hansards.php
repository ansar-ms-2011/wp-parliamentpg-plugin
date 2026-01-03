<?php
class Parliament_PG_API_Bills {
	public function register_route_bills() {
		register_rest_route('parliament-pg/v1', '/get-bills', array(
			'methods'  => 'GET',
			'callback' => array($this, 'get_bills_data'),
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

	public function get_bills_data( WP_REST_Request $request ) {
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

		$external_url = add_query_arg(
			$query,
			'http://pdis.test/api/v1/bills'
		);

		$response = wp_remote_get($external_url);

		if (is_wp_error($response)) {
			return new WP_Error('no_data', 'Unable to fetch bills data', array('status' => 404));
		}

		$body = wp_remote_retrieve_body($response);
		$data = json_decode($body, true);

		return rest_ensure_response($data);
	}
}
