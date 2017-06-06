<?php

/**
 * Fired during plugin deactivation
 *
 * @link       -
 * @since      1.0.0
 *
 * @package    Mdb_Kralen_Config
 * @subpackage Mdb_Kralen_Config/includes
 */

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @since      1.0.0
 * @package    Mdb_Kralen_Config
 * @subpackage Mdb_Kralen_Config/includes
 * @author     Tim <timedelaar@ziggo.nl>
 */
class Mdb_Kralen_Config_Deactivator {

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function deactivate() {
	    $page_id = get_option('mdb_bead_config_page_id');
	    if ($page_id == false) {
		write_log('error deleting page');
		return;
	    }
	    wp_delete_post($page_id);
	    delete_option('mdb_bead_config_page_id');
	    //self::remove_table();
	}
	
	private static function remove_table() {
	    global $wpdb;
	    $table_name = $wpdb->prefix . "mdb_bead_images";
	    $wpdb->query("DROP TABLE IF EXISTS $table_name;");
	    delete_option("mdb_bead_config_db_version");
	}

}
