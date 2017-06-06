<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       -
 * @since      1.0.0
 *
 * @package    Mdb_Kralen_Config
 * @subpackage Mdb_Kralen_Config/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Mdb_Kralen_Config
 * @subpackage Mdb_Kralen_Config/admin
 * @author     Tim <timedelaar@ziggo.nl>
 */
class Mdb_Kralen_Config_Admin {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of this plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;
		
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
		 * defined in Mdb_Kralen_Config_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Mdb_Kralen_Config_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style('bootstrap', plugin_dir_url(__FILE__) . 'bootstrap/css/bootstrap.min.css', array() , '3.3.7');
		wp_enqueue_style('bootstrap-colorpicker', plugin_dir_url(__FILE__) . 'colorpicker/css/bootstrap-colorpicker.css', array() , '2.5.1');
		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/mdb-kralen-config-admin.css', array(), $this->version, 'all' );

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
		 * defined in Mdb_Kralen_Config_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Mdb_Kralen_Config_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */
		wp_enqueue_script('angular', plugin_dir_url(__FILE__) . 'angular/angular.min.js', array('jquery') , '1.5.11', true);
		wp_enqueue_script('bootstrap', plugin_dir_url(__FILE__) . 'bootstrap/js/bootstrap.min.js', array() , '3.3.7', true);
		wp_enqueue_script('bootstrap-colorpicker', plugin_dir_url(__FILE__) . 'colorpicker/js/bootstrap-colorpicker.min.js', array('jquery', 'bootstrap') , '2.5.1', true);
		wp_enqueue_script('ng-file-upload', plugin_dir_url(__FILE__) . 'ng-file-upload/ng-file-upload.js', array('angular') , '12.2.13', true);
		wp_enqueue_script('beadconfig-settings', plugin_dir_url(__FILE__) . 'js/mdb-bead-config-settings.js', array('angular', 'ng-file-upload') , '1.0', true);
		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/mdb-kralen-config-admin.js', array( 'jquery', 'angular', 'bootstrap', 'bootstrap-colorpicker' ), $this->version, false );
	}

        public function add_plugin_admin_menu() {
            add_options_page('Mdb kralen configurator instellingen', 'mdb kralenconfig', 'manage_options', $this->plugin_name, array($this, 'display_plugin_setup_page'));
        }
        
        public function add_action_links($links) {
            $settings_link = array('<a href="' . admin_url('options-general.php?page=' . $this->plugin_name) . '">' . __('Settings', $this->plugin_name) . '<a>');
	    
            return array_merge($settings_link, $links);
        }
	
	public function display_plugin_setup_page() {
	    if (!function_exists( 'wc_get_product_terms' )) { 
		$base_dir = get_home_path();
		require_once $base_dir . '/wp-content/plugins/woocommerce/includes/wc-term-functions.php'; 
	    }
	    $bead_product_id = get_option('bead_config_letter_bead_product');
	    $products = $this->get_products();
	    $colors = $this->get_product_colors($bead_product_id);
	    $letters = $this->get_product_letters($bead_product_id);
	    include_once 'partials/mdb-kralen-config-admin-display.php';
	}
	
	private function update_options($page_id, $post_data) {
		wp_update_post(array('ID' => $page_id, 'post_title' => $post_data['title']));
		update_option('bead_config_letter_bead_product', $post_data['letter_bead_product']);
		update_option('bead_config_small_bead_product', $post_data['small_bead_product']);
		update_option('bead_config_big_bead_product', $post_data['big_bead_product']);
		update_option('bead_config_lace_product', $post_data['lace_product']);
		update_option('bead_config_text_color', $post_data['text_color']);
		update_option('bead_config_primary_color', $post_data['primary_color']);
		update_option('bead_config_border_color', $post_data['border_color']);
		update_option('bead_config_background_color', $post_data['background_color']);
	}
	
	private function get_options($page_id) {
	    $return = array();
	    
	    $return['title'] = get_the_title($page_id);
	    $return['letter_bead_product'] = get_option('bead_config_letter_bead_product', '-1');
	    $return['small_bead_product'] = get_option('bead_config_small_bead_product', '-1');
	    $return['big_bead_product'] = get_option('bead_config_big_bead_product', '-1');
	    $return['lace_product'] = get_option('bead_config_lace_product', '-1');
	    $return['text_color'] = get_option('bead_config_text_color', '#000000');
	    $return['primary_color'] = get_option('bead_config_primary_color', '#000000');
	    $return['border_color'] = get_option('bead_config_border_color', '#000000');
	    $return['background_color'] = get_option('bead_config_background_color', '#FFFFFF');
	    
	    return $return;
	}
	
	private function get_products() {
	    $args = array('post_type' => 'product', 'posts_per_page' => -1);
	    return get_posts($args);
	}
	
	private function get_product_colors($bead_product_id) {
	    return wc_get_product_terms($bead_product_id, 'pa_kleur');
	}
	
	private function get_product_letters($bead_product_id) {
	    return wc_get_product_terms($bead_product_id, 'pa_letter');
	}
}
