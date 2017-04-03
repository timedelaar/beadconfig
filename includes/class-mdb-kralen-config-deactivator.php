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
	    $bead_config_page_id = get_option('bead_config');
	    if ($bead_config_page_id == false) {
		return;
	    }
	    wp_delete_post($bead_config_page_id);
	}

}
