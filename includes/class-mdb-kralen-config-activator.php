<?php

/**
 * Fired during plugin activation
 *
 * @link       -
 * @since      1.0.0
 *
 * @package    Mdb_Kralen_Config
 * @subpackage Mdb_Kralen_Config/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    Mdb_Kralen_Config
 * @subpackage Mdb_Kralen_Config/includes
 * @author     Tim <timedelaar@ziggo.nl>
 */
class Mdb_Kralen_Config_Activator {

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function activate() {
	    self::create_page();
	    self::create_table();
	}
	
	private static function create_page() {
	    $post_content = '<base href="/" /><div ng-app="MdbBeadConfig"><mdb-bead-config></mdb-bead-config></div>';
	    //post status and options
	    $post = array(
		'comment_status' => 'closed',
		'ping_status' =>  'closed' ,
		'post_name' => 'bead_config',
		'post_status' => 'publish',
		'post_type' => 'page',
		'post_title' => 'MdB bead configurator',
		'post_content' => $post_content
	    );
	    //insert page and save the id
	    $newvalue = wp_insert_post( $post, false );
	    //save the id in the database
	    update_option( 'mdb_bead_config_page_id', $newvalue );
	}
	
	private static function create_table() {
	    global $wpdb;
	    $charset_collate = $wpdb->get_charset_collate();
	    $table_name = $wpdb->prefix . "mdb_bead_images";
	    $sql = "CREATE TABLE $table_name (
		    color varchar(100) NOT NULL,
		    letter varchar(20) NOT NULL,
		    image_location varchar(1000) NOT NULL,
		    PRIMARY KEY  (color, letter)
		    ) $charset_collate;";
	    
	    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
	    dbDelta($sql);
	    
	    add_option("mdb_bead_config_db_version", "1.0");
	}
}
