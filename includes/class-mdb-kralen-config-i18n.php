<?php

/**
 * Define the internationalization functionality
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @link       -
 * @since      1.0.0
 *
 * @package    Mdb_Kralen_Config
 * @subpackage Mdb_Kralen_Config/includes
 */

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      1.0.0
 * @package    Mdb_Kralen_Config
 * @subpackage Mdb_Kralen_Config/includes
 * @author     Tim <timedelaar@ziggo.nl>
 */
class Mdb_Kralen_Config_i18n {


	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    1.0.0
	 */
	public function load_plugin_textdomain() {

		load_plugin_textdomain(
			'mdb-kralen-config',
			false,
			dirname( dirname( plugin_basename( __FILE__ ) ) ) . '/languages/'
		);

	}



}
