<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://example.com
 * @since      1.0.0
 *
 * @package    Parliament_PG
 * @subpackage Parliament_PG/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Parliament_PG
 * @subpackage Parliament_PG/admin
 * @author     Ansar Mehmood Khan <ansar.dev2009@gmail.com>
 */
class Parliament_PG_Admin {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string $parliament_pg The ID of this plugin.
	 */
	private $parliament_pg;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string $version The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @param string $parliament_pg The name of this plugin.
	 * @param string $version The version of this plugin.
	 *
	 * @since    1.0.0
	 */
	public function __construct( $parliament_pg, $version ) {

		$this->parliament_pg = $parliament_pg;
		$this->version       = $version;

		add_action( 'admin_menu', [ $this, 'register_menu' ] );
		add_action( 'admin_init', [ $this, 'register_settings' ] );

        // Add filter to merge new view before saving
        add_filter('pre_update_option_parliament_pg_view_endpoints', [$this, 'merge_new_view_before_save'], 10, 2);

	}

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Plugin_Name_Loader as all the hooks are defined
		 * in that particular class.
		 *
		 * The Plugin_Name_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->parliament_pg, plugin_dir_url( __FILE__ ) . 'css/parliament-pg-admin.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Plugin_Name_Loader as all the hooks are defined
		 * in that particular class.
		 *
		 * The Plugin_Name_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_script( $this->parliament_pg, plugin_dir_url( __FILE__ ) . 'js/parliament-pg-admin.js', array( 'jquery' ), $this->version, false );

	}

    public function merge_new_view_before_save($new_value, $old_value) {
        // Only merge if admin and form submitted
        if (
                is_admin() &&
                !empty($_POST['new_view']) &&
                current_user_can('manage_options') &&
                check_admin_referer('parliament_pg_options_group-options') // Matches your settings_fields() nonce
        ) {
            $view = sanitize_text_field($_POST['new_view']);
            $backend  = esc_url_raw( isset( $_POST['new_backend_laravel'] ) ? $_POST['new_backend_laravel'] : '' );
            $frontend = esc_url_raw( isset( $_POST['new_frontend_wp'] ) ? $_POST['new_frontend_wp'] : '' );

            if (!is_array($new_value)) $new_value = [];
            // Merge new view
            $new_value[$view] = [
                    'backend' => $backend,
                    'frontend'=> $frontend
            ];
        }

        return $new_value; // WordPress will save this
    }

	/**
	 * Register admin menu.
	 */
	public function register_menu() {
		add_menu_page(
			'Parliament PG Settings',       // Page title
			'Parliament PG',                // Menu title
			'manage_options',               // Capability
			'parliament-pg-settings',       // Menu slug
			[ $this, 'settings_page' ],       // Callback
			'dashicons-admin-generic',      // Icon
			100                              // Position
		);
	}

	/**
	 * Register settings.
	 */
	public function register_settings() {
		register_setting( 'parliament_pg_options_group', 'parliament_pg_view_endpoints', [
			'sanitize_callback' => [ $this, 'sanitize_endpoints' ]
		] );
	}

	/**
	 * Sanitize view endpoints.
	 */
	public function sanitize_endpoints( $input ) {
		$clean = [];
		if ( is_array( $input ) ) {
			foreach ( $input as $view => $urls ) {
				$clean[ $view ] = [
					'backend'  => isset( $urls['backend'] ) ? esc_url_raw( $urls['backend'] ) : '',
					'frontend' => isset( $urls['frontend'] ) ? esc_url_raw( $urls['frontend'] ) : ''
				];
			}
		}

		return $clean;
	}

	/**
	 * Display settings page HTML.
	 */
	public function settings_page() {
		$endpoints = get_option( 'parliament_pg_view_endpoints', [] );
		?>
        <div class="wrap">
            <h1>Parliament PG Plugin Endpoints</h1>
            <form method="post" action="options.php">
				<?php settings_fields( 'parliament_pg_options_group' ); ?>
                <table class="form-table custom-table">
                    <thead>
                    <tr>
                        <th>Short Code Attr. Name </th>
                        <th>Frontend Endpoint (WP)</th>
                        <th>Backend Endpoint (Laravel)</th>
                    </tr>
                    </thead>
                    <tbody>
					<?php foreach ( $endpoints as $view => $urls ): ?>
                        <tr>
                            <td><input type="text"
                                       name="parliament_pg_view_endpoints[<?php echo esc_attr( $view ); ?>][view]"
                                       value="<?php echo esc_attr( $view ); ?>" readonly  ></td>

                            <td><input type="text"
                                       name="parliament_pg_view_endpoints[<?php echo esc_attr( $view ); ?>][frontend]"
                                       value="<?php echo esc_url( $urls['frontend'] ); ?>" class="regular-text"></td>
                            <td><input type="text"
                                       name="parliament_pg_view_endpoints[<?php echo esc_attr( $view ); ?>][backend]"
                                       value="<?php echo esc_url( $urls['backend'] ); ?>" class="regular-text"></td>
                        </tr>
					<?php endforeach; ?>

                    <tr><td colspan="3"><h2 style="margin: 0 !important;">Add New</h2></td></tr>
                    <tr>
                        <td>
                            <input type="text" name="new_view" placeholder="View Attribute Name" class="new_view">
                        </td>
                        <td>
                            <input type="text" name="new_frontend_wp" placeholder="Frontend endpoint (WP)"
                                   class="new_frontend_wp regular-text">
                        </td>
                        <td>
                            <input type="text" name="new_backend_laravel" placeholder="Backend endpoint (Laravel)"
                                   class="new_backend_laravel regular-text">
                        </td>
                    </tr>
                    </tbody>
                </table>
				<?php submit_button( 'Save Endpoints' ); ?>
            </form>
        </div>
		<?php
	}

}
