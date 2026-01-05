<?php
class Parliament_PG_API_Meetings {
	public function register_route_meetings() {
		register_rest_route('parliament-pg/v1', '/get-meetings', array(
			'methods'  => 'GET',
			'callback' => array($this, 'get_meetings_data'),
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
				'sortBy' => array(
					'sanitize_callback' => 'sanitize_text_field',
					'default' => 'desc',
				),
			),
		));
	}

	public function get_meetings_data( WP_REST_Request $request ) {
		$query = array(
			'page'       => $request->get_param('page') ?: 1,
			'statusId'       => $request->get_param('statusId') ?: '',
			'categoryId'       => $request->get_param('categoryId') ?: '',
			'sortBy'       => $request->get_param('sortBy') ?: '',
			'year'       => $request->get_param('year') ?: '',
		);

		// Optional filters
		foreach (['year', 'category_id', 'status_id', 'sortOrder'] as $param) {
			$value = $request->get_param($param);
			if ($value !== null && $value !== '') {
				$query[$param] = $value;
			}
		}

		$external_url = add_query_arg(
			$query,
			'http://pdis.test/api/v1/meetings'
		);

		$response = wp_remote_get($external_url);

		if (is_wp_error($response)) {
			return new WP_Error('no_data', 'Unable to fetch meetings data', array('status' => 404));
		}

		$body = wp_remote_retrieve_body($response);
		$data = json_decode($body, true);

		return rest_ensure_response($data);
	}
}
