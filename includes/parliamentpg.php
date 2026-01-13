<?php

if ( ! function_exists('parliament_pg_log') ) {
	function parliament_pg_log( $message ) {
		$file = WP_CONTENT_DIR . '/parliament-debug.log';

		if ( is_array($message) || is_object($message) ) {
			$message = print_r($message, true);
		}

		error_log(
			"[" . date("Y-m-d H:i:s") . "] " . $message . "\n",
			3,
			$file
		);
	}
}

/**
 * The file that defines the core plugin class
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @link       https://example.com
 * @since      1.0.0
 *
 * @package    Parliament_PG
 * @subpackage Parliament_PG/includes
 */

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      1.0.0
 * @package    Parliament_PG
 * @subpackage Parliament_PG/includes
 * @author     Ansar Mehmood Khan <ansar.dev2009@gmail.com>
 */
class Parliament_PG {

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      Parliament_PG_Loader $loader Maintains and registers all hooks for the plugin.
	 */
	protected $loader;

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string $plugin_name The string used to uniquely identify this plugin.
	 */
	protected $parliament_pg;

	/**
	 * The current version of the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string $version The current version of the plugin.
	 */
	protected $version;

	/**
	 * Define the core functionality of the plugin.
	 *
	 * Set the plugin name and the plugin version that can be used throughout the plugin.
	 * Load the dependencies, define the locale, and set the hooks for the admin area and
	 * the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function __construct() {
		if ( defined( 'PARLIAMENT_PG_VERSION' ) ) {
			$this->version = PARLIAMENT_PG_VERSION;
		} else {
			$this->version = '1.0.0';
		}

		$this->parliament_pg = 'parliament-pg';

		$this->load_dependencies();
		$this->set_locale();
		$this->define_admin_hooks();
		$this->define_public_hooks();

		$this->define_api_hooks();
	}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * Include the following files that make up the plugin:
	 *
	 * - Plugin_Name_Loader. Orchestrates the hooks of the plugin.
	 * - Plugin_Name_i18n. Defines internationalization functionality.
	 * - Plugin_Name_Admin. Defines all hooks for the admin area.
	 * - Plugin_Name_Public. Defines all hooks for the public side of the site.
	 *
	 * Create an instance of the loader which will be used to register the hooks
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function load_dependencies() {

		/**
		 * The class responsible for orchestrating the actions and filters of the
		 * core plugin.
		 */

		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/parliamentpg-loader.php';

		/**
		 * The class responsible for defining internationalization functionality
		 * of the plugin.
		 */

		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/parliamentpg-i18n.php';

		/**
		 * The class responsible for defining all actions that occur in the admin area.
		 */

		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/parliamentpg-admin.php';

		/**
		 * The class responsible for defining all actions that occur in the public-facing
		 * side of the site.
		 */

		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/parliamentpg-public.php';


		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/api-routes/filters.php';
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/api-routes/bills.php';
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/api-routes/hansards.php';
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/api-routes/meetings.php';
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/api-routes/notice-papers.php';
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/api-routes/members.php';
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/api-routes/governors.php';
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/api-routes/districts.php';
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/api-routes/provinces.php';
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/api-routes/images.php';
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/api-routes/videos.php';

		$this->loader = new Parliament_PG_Loader();

	}

	/**
	 * Define the locale for this plugin for internationalization.
	 *
	 * Uses the Plugin_Name_i18n class to set the domain and to register the hook
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function set_locale() {

		$plugin_i18n = new Parliament_PG_i18n();

		$this->loader->add_action( 'plugins_loaded', $plugin_i18n, 'load_plugin_textdomain' );

	}

	/**
	 * Register all the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_admin_hooks() {

		$plugin_admin = new Parliament_PG_Admin( $this->get_parliament_pg(), $this->get_version() );

		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_styles' );
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts' );

	}

	/**
	 * Register all the hooks related to the public-facing functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_public_hooks() {

		$plugin_public = new Parliament_PG_Public( $this->get_parliament_pg(), $this->get_version() );

		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_styles' );
		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_scripts' );
		$this->loader->add_action( 'init', $plugin_public, 'register' );
		$this->loader->add_action( 'vc_before_init', $plugin_public, 'register' );

	}


	/**
	 * Register the custom REST API routes.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_api_hooks() {

		$plugin_api_bills = new Parliament_PG_API_Bills();
		$plugin_api_images = new Parliament_PG_API_Images();
		$plugin_api_videos = new Parliament_PG_API_Videos();
		$plugin_api_members = new Parliament_PG_API_Members();
		$plugin_api_filters = new Parliament_PG_API_Filters();
		$plugin_api_districts = new Parliament_PG_API_Districts();
		$plugin_api_provinces = new Parliament_PG_API_Provinces();
		$plugin_api_governors = new Parliament_PG_API_Governors();
		$plugin_api_hansards = new Parliament_PG_API_Hansards();
		$plugin_api_meetings = new Parliament_PG_API_Meetings();
		$plugin_api_notice_papers = new Parliament_PG_API_Notice_Papers();

		$this->loader->add_action( 'rest_api_init', $plugin_api_filters, 'register_route_filters' );
		$this->loader->add_action( 'rest_api_init', $plugin_api_bills, 'register_route_bills' );
		$this->loader->add_action( 'rest_api_init', $plugin_api_hansards, 'register_route_hansards' );
		$this->loader->add_action( 'rest_api_init', $plugin_api_meetings, 'register_route_meetings' );
		$this->loader->add_action( 'rest_api_init', $plugin_api_notice_papers, 'register_route_notice_papers' );
		$this->loader->add_action( 'rest_api_init', $plugin_api_members, 'register_route_members' );
		$this->loader->add_action( 'rest_api_init', $plugin_api_governors, 'register_route_governors' );
		$this->loader->add_action( 'rest_api_init', $plugin_api_districts, 'register_route_districts' );
		$this->loader->add_action( 'rest_api_init', $plugin_api_provinces, 'register_route_provinces' );
		$this->loader->add_action( 'rest_api_init', $plugin_api_images, 'register_route_images' );
		$this->loader->add_action( 'rest_api_init', $plugin_api_videos, 'register_route_videos' );
	}


	/**
	 * Run the loader to execute all the hooks with WordPress.
	 *
	 * @since    1.0.0
	 */
	public function run() {
		$this->loader->run();
	}

	/**
	 * The name of the plugin used to uniquely identify it within the context of
	 * WordPress and to define internationalization functionality.
	 *
	 * @return    string    The name of the plugin.
	 * @since     1.0.0
	 */
	public function get_parliament_pg() {
		return $this->parliament_pg;
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 *
	 * @return    Parliament_PG_Loader    Orchestrates the hooks of the plugin.
	 * @since     1.0.0
	 */
	public function get_loader() {
		return $this->loader;
	}

	/**
	 * Retrieve the version number of the plugin.
	 *
	 * @return    string    The version number of the plugin.
	 * @since     1.0.0
	 */
	public function get_version() {
		return $this->version;
	}

}
