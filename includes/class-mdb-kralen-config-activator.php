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
	    $post_content = '<div ng-app="BeadConfig"><bead-config></bead-config></div>';
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
	    update_option( 'bead_config', $newvalue );
	}
}
