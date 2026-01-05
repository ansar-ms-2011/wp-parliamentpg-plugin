<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://example.com
 * @since      1.0.0
 *
 * @package    Parliament_PG
 * @subpackage Parliament_PG/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Parliament_PG
 * @subpackage Parliament_PG/public
 * @author     Ansar Mehmood Khan <ansar.dev2009@gmail.com>
 */
class Parliament_PG_Public {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $parliament_pg    The ID of this plugin.
	 */
	private $parliament_pg;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	protected $assets_manifests;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $parliament_pg       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $parliament_pg, $version ) {

		$this->parliament_pg = $parliament_pg;
		$this->version = $version;
		$this->assets_manifests = json_decode(file_get_contents(plugin_dir_path( __FILE__ ) . 'assets/asset-manifest.json'));
	}

	public function register () {
		add_shortcode('parliament_pg_shortcode', [$this, 'parliament_pg_handler']);
	}

	public function parliament_pg_handler($atts) {
		$this->enqueue_styles();
		$this->enqueue_scripts();

		// Get all saved endpoints
		$endpoints = get_option('parliament_pg_view_endpoints', []);

		// Merge attributes with defaults
		$atts = shortcode_atts(
			[
				'view' => 'default',
				'id'   => '',
			],
			$atts,
			'parliament_pg_shortcode'
		);

		// Load the partial HTML with
		// Variables you want to pass
		$view = esc_attr($atts['view']);
		$id   = esc_attr($atts['id']);

		if (!isset($endpoints[$view])) {
			return "<p>No endpoints configured for this view='{$view}'</p>";
		}

		$backend_url  = isset( $endpoints[ $view ]['backend'] ) ? $endpoints[ $view ]['backend'] : '';
		$frontend_url = isset( $endpoints[ $view ]['frontend'] ) ? $endpoints[ $view ]['frontend'] : '';

		// Path to the partial
		$partial_file = plugin_dir_path(dirname(__FILE__)) . 'public/partials/plugin-parliamentpg-display.php';

		// Start output buffering
		ob_start();
		include $partial_file; // partial can use $view and $id
		$html = ob_get_clean();

		return $html;
	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Plugin_Name_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Plugin_Name_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */
		wp_enqueue_style( $this->parliament_pg, plugin_dir_url( __FILE__ ) . 'css/parliament-pg-public.css', array(), $this->version, 'all' );
        wp_enqueue_style( 'parliament_pg_react_app_css', plugin_dir_url( __FILE__ ) . 'assets/css/parliament-pg-plugin.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */

	public function enqueue_scripts() {
		$is_dev = (defined('WP_DEBUG') && WP_DEBUG);

		wp_enqueue_script(
			$this->parliament_pg,
			plugin_dir_url( __FILE__ ) . 'js/parliament-pg-public.js',
			array( 'jquery' ),
			$this->version,
			false
		);

		if ( $is_dev ) {
			// Point to the React Dev Server
			wp_enqueue_script( 'parliament_pg_react_app_js', 'http://localhost:3000/static/js/bundle.js', array(), $this->version, array( 'strategy' => 'defer' ) );
		} else {
			// Normal build path
			$manifest_css_file = ltrim($this->assets_manifests->files->{'main.css'}, './');
			$main_css_url = plugin_dir_url( __FILE__ ) . 'assets/' . $manifest_css_file;
			wp_enqueue_style( 'parliament_pg_react_app_main_css', $main_css_url, array(), $this->version );

			$manifest_file = ltrim( $this->assets_manifests->files->{'main.js'}, './' );
			$main_js_url = plugin_dir_url( __FILE__ ) . 'assets/' . $manifest_file;
			wp_enqueue_script( 'parliament_pg_react_app_js', $main_js_url, array(), $this->version, array( 'strategy' => 'defer' ) );
		}

		// This creates a global window.myPluginData object in JavaScript
		wp_localize_script( 'parliament_pg_react_app_js', 'myPluginData', array(
			'root'  => esc_url_raw( rest_url() ), // Base URL for WP API
			'nonce' => wp_create_nonce( 'wp_rest' ), // Security token
			'user'  => get_current_user_id(),
			'strings' => array(
				'loading' => __( 'Fetching data...', 'parliament-pg' ),
				'error'   => __( 'Something went wrong.', 'parliament-pg' ),
			)
		) );
	}

}
