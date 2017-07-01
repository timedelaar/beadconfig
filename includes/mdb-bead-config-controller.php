<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
if ( ! function_exists('write_log')) {
   function write_log ( $log )  {
      if ( is_array( $log ) || is_object( $log ) ) {
         error_log( print_r( $log, true ) );
      } else {
         error_log( $log );
      }
   }
}


/**
 * Description of mdb-bead-config-controller
 *
 * @author timed
 */
class mdb_bead_config_controller extends WP_REST_Controller {
    public function register_routes() {
	$version = 'v1';
	$namespace = 'bead-config';
	$base = $namespace . '/' . $version;
	
	register_rest_route($base, '/plugin-settings/', array(
	    'methods' => 'GET',
	    'callback' => array($this, 'get_plugin_settings'),
	    'permission_callback' => array($this, 'is_admin')
	));
	register_rest_route($base, '/plugin-settings/', array(
	    'methods' => 'PUT',
	    'callback' => array($this, 'save_plugin_settings'),
	    'permission_callback' => array($this, 'is_admin')
	));
	register_rest_route($base, '/plugin-settings/image/', array(
	    'methods' => 'POST',
	    'callback' => array($this, 'upload_image'),
	    'permission_callback' => array($this, 'is_admin')
	));
	register_rest_route($base, '/configurator-data', array(
	    'methods' => 'GET',
	    'callback' => array($this, 'get_configurator_data')
	));
	register_rest_route($base, '/add-to-cart/', array(
	    'methods' => 'POST',
	    'callback' => array($this, 'add_to_cart')
	));
    }
	
    public function get_plugin_settings() {
	$page_id = get_option('mdb_bead_config_page_id');
	
	$general = $this->get_general_settings($page_id);
	$styling = $this->get_styling_settings();
	
	$colors = $this->get_product_colors($general['letter_bead_product']);
	$letters = $this->get_product_letters($general['letter_bead_product']);
	$beads = $this->get_beads($colors, $general['letter_bead_product']);
	$laces = $this->get_laces($general['lace_product']);
	
	$settings = array(
	    'general' => $general,
	    'styling' => $styling,
	    'beads' => $beads,
	    'laces' => $laces
	);
	
	$return = array(
	    'settings' => $settings,
	    'colors' => $colors,
	    'letters' => $letters
	);
	return $return;
    }
    
    public function save_plugin_settings($request) {
	global $wpdb;
	$settings = $request->get_json_params();
	$general = $settings['general'];
	$styling = $settings['styling'];
	
	$page_id = get_option('mdb_bead_config_page_id');
	$post_table = $wpdb->prefix . "posts";
	$query = "UPDATE " . $post_table . " SET post_title = '" . $general['title'] . "' WHERE ID = " . $page_id . ";";
	$wpdb->query($query);
	
	update_option('bead_config_letter_bead_product', $general['letter_bead_product']);
	update_option('bead_config_small_bead_product', $general['small_bead_product']);
	update_option('bead_config_big_bead_product', $general['big_bead_product']);
	update_option('bead_config_lace_product', $general['lace_product']);
	
	update_option('bead_config_text_color', $styling['text_color']);
	update_option('bead_config_primary_color', $styling['primary_color']);
	update_option('bead_config_border_color', $styling['border_color']);
	update_option('bead_config_background_color', $styling['background_color']);
	
	$response = new WP_REST_Response();
	$response->set_status(204);
	return $response;
    }
    
    public function upload_image($request) {
	$params = $request->get_params();
	$image = $request->get_file_params()['image'];
	
	$image_info = $this->save_image($image, $params['color'], $params['letter']);
	if ($image_info == null){
	    $response = new WP_REST_Response();
	    $response->set_status(500);
	    return $response;
	}
	else {
	    $this->link_to_wc($image_info, $params['color'], $params['variation_id']);
	}
	$response = new WP_REST_Response($params);
	return $response;
    }
    
    public function get_configurator_data($request) {
	$bead_product_id = get_option('bead_config_letter_bead_product', '-1');
	$lace_product_id = get_option('bead_config_lace_product', '-1');
	$colors = $this->get_product_colors($bead_product_id);
	$letters = $this->get_product_letters($bead_product_id);
	$beads = $this->get_beads($colors, $bead_product_id);
	$laces = $this->get_laces($lace_product_id);
	
	$return = array(
	    'beads' => $beads,
	    'laces' => $laces,
	    'colors' => $colors,
	    'letters' => $letters
	);
	return $return;
    }
    
    public function add_to_cart($request) {
	$params = $request->get_json_params();
	$response = new WP_REST_Response();
	global $woocommerce;
	$necklace = $params['necklace'];
	$lace_type = $params['lace_type'];
	$bead_product_id = get_option('bead_config_letter_bead_product', -1);
	$lace_product_id = get_option('bead_config_lace_product', -1);
	if ($bead_product_id == -1 || $lace_product_id == -1){
	    $response->set_status(500);
	    return $response;
	}
	
	$necklace_length = count($necklace);
	for ($index = 0; $index < $necklace_length; $index++) {
	    $bead = $necklace[$index];
	    $added = $woocommerce->cart->add_to_cart($bead_product_id, 1, $bead['variation_id'], array(
		'kleur' => $bead['color'],
		'letter' => $bead['letter']
	    ));
	    if (!$added) {
	    $response->set_status(500);
	    return $response;
	    }
	}
	$lace_added = $woocommerce->cart->add_to_cart($lace_product_id, 1, $lace_type['variation_id'], array(
	    'veter_type' => $lace_type['type']
	));
	if (!$lace_added) {
	    $response->set_status(500);
	    return $response;
	}
	return $response;
    }
    
    public function is_admin() {
	return current_user_can('administrator');
    }
    
    private function get_general_settings($page_id) {
	$result = array();
	$result['title'] = get_the_title($page_id);
	$result['letter_bead_product'] = get_option('bead_config_letter_bead_product', '-1');
	$result['small_bead_product'] = get_option('bead_config_small_bead_product', '-1');
	$result['big_bead_product'] = get_option('bead_config_big_bead_product', '-1');
	$result['lace_product'] = get_option('bead_config_lace_product', '-1');
	return $result;
    }
    
    private function get_styling_settings() {
	$result = array();
	$result['text_color'] = get_option('bead_config_text_color', '#000000');
	$result['primary_color'] = get_option('bead_config_primary_color', '#000000');
	$result['border_color'] = get_option('bead_config_border_color', '#000000');
	$result['background_color'] = get_option('bead_config_background_color', '#FFFFFF');
	return $result;
    }
    
    private function get_beads($colors, $bead_product_id) {
	$result = array();
	$colors_length = count($colors);
	for ($color_index = 0; $color_index < $colors_length; $color_index++) {
	    $color = $colors[$color_index];
	    $result[$color->slug] = $this->get_bead_images($color->slug, $bead_product_id);
	}
	return $result;
    }
    
    private function get_laces($lace_product_id) {
	$lace_product = new WC_Product_Variable($lace_product_id);
	return $lace_product->get_available_variations();
    }
    
    private function get_product_colors($bead_product_id) {
	return wp_get_post_terms($bead_product_id, 'pa_kleur');
    }

    private function get_product_letters($bead_product_id) {
	return wp_get_post_terms($bead_product_id, 'pa_letter');
    }
    
    private function get_bead_images($color, $bead_product_id) {
	$beads = $this->query_db($color, $bead_product_id);
	$beads_length = count($beads);
	$return = array();
	for ($bead_index = 0; $bead_index < $beads_length; $bead_index++) {
	    $bead = $beads[$bead_index];
	    if ($bead['letter'] != '_') {
		$bead['type'] = 'letter_bead';
	    }
	    else {
		$bead['type'] = 'spacer_bead';
	    }
	    $return[$bead['letter']] = $bead;
	}
	return $return;
    }
    
    private function query_db($color, $bead_product_id) {
	global $wpdb;
	$image_table = $wpdb->prefix . "mdb_bead_images";
	$post_table = $wpdb->prefix . "posts";
	$postmeta_table = $wpdb->prefix . "postmeta";
	$query = "SELECT PT2.ID AS variation_id, x.color, x.letter, x.price, IT.image_location 
		  FROM " . $post_table . " PT 
		  JOIN " . $post_table . " PT2 ON PT.ID = PT2.post_parent 
		  LEFT OUTER JOIN (SELECT PMT.post_id, PMT.meta_value AS color, PMT2.meta_value AS letter, PMT3.meta_value AS price 
			FROM " . $postmeta_table . " PMT 
			JOIN " . $postmeta_table . " PMT2 ON PMT.post_id = PMT2.post_id 
			JOIN " . $postmeta_table . " PMT3 ON PMT.post_id = PMT3.post_id
			WHERE PMT.meta_key = 'attribute_pa_kleur' 
			AND PMT2.meta_key = 'attribute_pa_letter'
			AND PMT3.meta_key = '_price'
			AND PMT.meta_value = '" . $color . "') x 
			ON PT2.ID = x.post_id 
		  LEFT OUTER JOIN " . $image_table . " IT ON x.color = IT.color AND x.letter = IT.letter 
		  WHERE PT.ID = " . $bead_product_id . "
		  AND x.letter IS NOT NULL
		  AND x.letter <> ''
		  ORDER BY x.letter ASC;";
	$result = $wpdb->get_results($query, ARRAY_A);
	return $result;
    }
    
    private function save_image($image, $color, $letter) {
	$extension = pathinfo($image['name'], PATHINFO_EXTENSION);
	$uploads_dir = 'wp-content/uploads/mdb-bead-config/' . $color;
	if (!wp_mkdir_p(ABSPATH . $uploads_dir)) {
	    return null;
	}
	$destination = $uploads_dir . '/' . $letter . '.' . $extension;
	if (!move_uploaded_file($image['tmp_name'], ABSPATH . $destination)) {
	    return null;
	}
	if ($this->update_database_image($color, $letter, $destination)) {
	    return array('file' => $destination, 'filetype' => wp_check_filetype(basename($destination), null));
	}
	else {
	    return null;
	}
    }
    
    private function update_database_image($color, $letter, $image_loc) {
	global $wpdb;
	$table = $wpdb->prefix . "mdb_bead_images";
	$data = array(
	    'color' => $color,
	    'letter' => $letter,
	    'image_location' => $image_loc
	);
	$format = array('%s', '%s', '%s');
	return $wpdb->replace($table, $data, $format);
    }
    
    private function link_to_wc($file_info, $color, $variation_id) {
	$filename = $file_info['file'];
	$filetype = $file_info['filetype'];
	$upload_dir = wp_upload_dir()['baseurl'] . '/mdb-bead-config/' . $color;
	$attachment = array(
	    'guid' => $upload_dir . '/' . basename($filename),
	    'post_mime_type' => $filetype['type'],
	    'post_title' => preg_replace('/\.[^.]+$/', '', basename($filename)),
	    'post_content' => '',
	    'post_status' => 'inherit'
	);
	
	$attach_id = wp_insert_attachment($attachment, $filename, $variation_id);
	
	require_once ABSPATH . 'wp-admin/includes/image.php';
	
	$attach_data = wp_generate_attachment_metadata($attach_id, $filename);
	wp_update_attachment_metadata($attach_id, $attach_data);
	
	set_post_thumbnail($variation_id, $attach_id);
    }
}
