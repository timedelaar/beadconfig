<?php

/**
 * Provide a admin area view for the plugin
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @link       -
 * @since      1.0.0
 *
 * @package    Mdb_Kralen_Config
 * @subpackage Mdb_Kralen_Config/admin/partials
 */
?>

<!-- This file should primarily consist of HTML with a little bit of PHP. -->
<!-- Bead config admin page -->
<h2>MdB Kralenconfigurator Settings</h2>
<form name="mdbConfigSettings" novalidate ng-app="beadConfigSettings" ng-controller="beadConfigSettings as ctrl">
    <div class="row">
	<div class="col-xs-12 col-lg-7">
	    <ul class="nav nav-tabs">
		<li class="active"><a data-toggle="tab" href="#general">Standaard</a></li>
		<li><a data-toggle="tab" href="#style">Uiterlijk</a></li>
		<li><a data-toggle="tab" href="#beads">Kralen</a></li>
	    </ul>

	    <div class="tab-content">
		<div id="general" class="tab-pane active">
		    <div class="form-group">
			<label for="title">Pagina titel</label>
			<input type="text" class="form-control" name="title" ng-model="ctrl.settings.general.title" placeholder="Vul een titel in.." />
		    </div>
		    <div class="form-group">
			<label for="letter_bead_product">Letter kraal product</label>
			<select class="form-control" name="letter_bead_product" ng-model="ctrl.settings.general.letter_bead_product">
			    <?php
				$l = count($products);
				for($i = 0; $i < $l; $i++) {
				    echo "<option value=\"" . $products[$i]->ID . "\">" . $products[$i]->post_title . "</option>";
				}
			    ?>
			</select>
		    </div>
		    <div class="form-group">
			<label for="small_bead_product">Kleine tussenkraal product</label>
			<select class="form-control" name="small_bead_product" ng-model="ctrl.settings.general.small_bead_product">
			    <?php
				for($i = 0; $i < $l; $i++) {
				    echo "<option value=\"" . $products[$i]->ID . "\">" . $products[$i]->post_title . "</option>";
				}
			    ?>
			</select>
		    </div>
<!--		    <div class="form-group">
			<label for="big_bead_product">Grote tussenkraal product</label>
			<select class="form-control" name="big_bead_product" ng-model="ctrl.settings.general.big_bead_product">
			    <?php
				for($i = 0; $i < $l; $i++) {
				    echo "<option value=\"" . $products[$i]->ID . "\">" . $products[$i]->post_title . "</option>";
				}
			    ?>
			</select>
		    </div>-->
		    <div class="form-group">
			<label for="lace_product">Veter product</label>
			<select class="form-control" name="lace_product" ng-model="ctrl.settings.general.lace_product">
			    <?php
				for($i = 0; $i < $l; $i++) {
				    echo "<option value=\"" . $products[$i]->ID . "\">" . $products[$i]->post_title . "</option>";
				}
			    ?>
			</select>
		    </div>
		</div>
		<div id="style" class="tab-pane">
		    <div class="form-horizontal">
			<div class="form-group">
			    <label for="text_color" class="control-label col-xs-2">Tekst kleur</label>
			    <div class="col-xs-3">
				<input type="text" class="form-control colorpicker" name="text_color" ng-model="ctrl.settings.styling.text_color" placeholder="Selecteer een tekst kleur.."/>
			    </div>
			</div>
			<div class="form-group">
			    <label for="primary_color" class="control-label col-xs-2">Hoofd kleur</label>
			    <div class="col-xs-3">
				<input type="text" class="form-control colorpicker" name="primary_color" ng-model="ctrl.settings.styling.primary_color" placeholder="Selecteer een primaire kleur.."/>
			    </div>
			</div>
			<div class="form-group">
			    <label for="border_color" class="control-label col-xs-2">Rand kleur</label>
			    <div class="col-xs-3">
				<input type="text" class="form-control colorpicker" name="border_color" ng-model="ctrl.settings.styling.border_color" placeholder="Selecteer een rand kleur.."/>
			    </div>
			</div>
			<div class="form-group">
			    <label for="background_color" class="control-label col-xs-2">Achtergrond kleur</label>
			    <div class="col-xs-3">
				<input type="text" class="form-control colorpicker" name="background_color" ng-model="ctrl.settings.styling.background_color" placeholder="Selecteer een achtergrond kleur.."/>
			    </div>
			</div>
		    </div>
		</div>
		<div id="beads" class="tab-pane">
		    <div class="form-horizontal">
			<div class="form-group">
			    <label for="color_line" class="control-label col-xs-2">Kleurlijn</label>
			    <div class="col-xs-5">
				<select class="form-control" name="color_line" ng-model="ctrl.color_line">
				    <option value="{{color.slug}}" ng-repeat="color in ctrl.colors">{{color.name}}</option>
				</select>
			    </div>
			</div>
			<div ng-show="ctrl.color_line === color.slug" ng-repeat="color in ctrl.colors">
			    <div class="form-group letter-group" ng-repeat="bead in ctrl.settings.beads[color.slug]">
				<label for="{{color.slug}}_{{bead.letter}}" class="control-label col-xs-2" ng-class="{ 'lower': (ctrl.settings.beads[color.slug][bead.letter].image !== undefined || ctrl.settings.beads[color.slug][bead.letter].image_location) }">{{bead.letter}}</label>
				<div type="text" class="btn btn-default"
				     ng-model="ctrl.settings.beads[color.slug][bead.letter].image" 
				     name="{{color.slug}}_{{bead.letter}}" required
				     ngf-select ngf-pattern="'image/*'" ngf-accept="'image/*'" ngf-max-size="1MB">Kies afbeelding</div>
				<img ngf-thumbnail="ctrl.settings.beads[color.slug][bead.letter].image" 
				     class="thumb"/>
				<img ng-src="/{{ctrl.settings.beads[color.slug][bead.letter].imageUrl}}" 
				     ng-show="ctrl.settings.beads[color.slug][bead.letter].imageUrl && (ctrl.settings.beads[color.slug][bead.letter].image === null || ctrl.settings.beads[color.slug][bead.letter].image === undefined)" 
				     class="thumb"/>
			    </div>

			</div>
		    </div>
		</div>
	    </div>
	    <button type="submit" ng-click="ctrl.save(mdbConfigSettings)" class="btn btn-default">Opslaan</button>
	</div>
    </div>
</form>
