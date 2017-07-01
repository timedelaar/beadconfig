(function () {
	angular.module('beadConfigSettings', ['ngFileUpload']);

	angular.module('beadConfigSettings').run(function($http) {
		$http.defaults.headers.common['X-WP-Nonce'] = wpApiSettings.nonce;
	});
	
	angular.module('beadConfigSettings').controller('beadConfigSettings', ['beadConfigSettingsService', beadConfigSettings]);

	function beadConfigSettings(settingsService) {
		var ctrl = this;

		ctrl.settings = {
			general: {},
			styling: {},
			beads: {}
		};
		ctrl.color_line = '';

		ctrl.save = save;

		angular.element(document).ready(init);

		function init() {
			startSpinner();
			settingsService.getSettings().then(function success(response) {
				ctrl.settings = response.data.settings;
				ctrl.letters = response.data.letters;
				ctrl.colors = response.data.colors;
				if (ctrl.colors && ctrl.colors.length > 0) {
					ctrl.color_line = ctrl.colors[0].slug;
				}
				for (var color in ctrl.settings.beads) {
					for (var key in ctrl.settings.beads[color]) {
						var bead = ctrl.settings.beads[color][key];
						bead.imageUrl = decacheImageUrl(bead.image_location);
					}
				}
				stopSpinner();
			}, function error(response) {
				console.error('error fetching settings', response);
				stopSpinner();
			});
		}

		function save(form) {
			startSpinner();
			for (var color_index = 0, colors_length = ctrl.colors.length; color_index < colors_length; color_index++) {
				var color = ctrl.colors[color_index];
				for (var key in ctrl.settings.beads[color.slug]) {
					var bead = ctrl.settings.beads[color.slug][key];
					if (!bead.letter || bead.hasOwnProperty())
						continue;

					var imageName = color.slug + '_' + bead.letter;
					if (form[imageName].$dirty) {
						settingsService.uploadImage(bead.image, color.slug, bead.letter, bead.variation_id).then(function success(response) {
							var data = response.data;
							var bead = ctrl.settings.beads[data.color][data.letter];
							if (bead) {
								bead.imageUrl = decacheImageUrl(bead.image_location);
							}
						}, function error(response) {
							console.error('error uploading image', response);
						}, function loading (evt) {
						});
					}
				}
			}
			settingsService.saveSettings(ctrl.settings).then(function success(response) {
				stopSpinner();
			}, function error(response) {
				console.error('error saving settings', response);
				stopSpinner();
			});
		}

		function decacheImageUrl(location) {
			if (!location)
				return;

			return location + '?cb=' + new Date().getTime();
		}

		function startSpinner() {
			var loader = angular.element('<div class="loader-background"><div class="loader"></div>');
			var form = angular.element('body');
			form.append(loader);
		}

		function stopSpinner() {
			angular.element('.loader-background').remove();
		}
	}
})();