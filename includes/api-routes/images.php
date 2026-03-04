<?php
class Parliament_PG_API_Images {
	public function register_route_images() {
		register_rest_route('parliament-pg/v1', '/get-images', array(
			'methods'  => 'GET',
			'callback' => array($this, 'get_images_data'),
			'permission_callback' => '__return_true',
			'args' => array(
				'aId' => array(
					'sanitize_callback' => 'sanitize_text_field',
				),
			),
		));
	}

	public function get_images_data( WP_REST_Request $request ) {
		$endpoints = get_option( 'parliament_pg_view_endpoints', [] );

		$query = array(
			'aId'       => $request->get_param('aId') ?: '',
		);

		// Optional filters
		foreach (['aId'] as $param) {
			$value = $request->get_param($param);
			if ($value !== null && $value !== '') {
				$query[$param] = $value;
			}
		}

		$external_url = add_query_arg( $query, $endpoints['images']['backend']);

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

//
//add_action('rest_api_init', function () {
//	register_rest_route('img-proxy/v1', '/fetch', [
//		'methods' => 'GET',
//		'callback' => function ($request) {
//			$url = esc_url_raw($request->get_param('url'));
//
//			$response = wp_remote_get($url);
//			if (is_wp_error($response)) {
//				return new WP_Error('fetch_failed', 'Image fetch failed');
//			}
//
//			$body = wp_remote_retrieve_body($response);
//			$type = wp_remote_retrieve_header($response, 'content-type');
//
//			header("Content-Type: $type");
//			echo $body;
//			exit;
//		}
//	]);
//});
