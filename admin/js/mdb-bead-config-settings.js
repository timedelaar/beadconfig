(function () {
	angular.module('beadConfigSettings', ['ngFileUpload']).controller('beadConfigSettings', ['beadConfigSettingsService', beadConfigSettings]);

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
				for (var letter_index = 0, letters_length = ctrl.letters.length; letter_index < letters_length; letter_index++) {
					var letter = ctrl.letters[letter_index];
					var imageName = color.slug + '_' + letter;
					if (form[imageName].$dirty) {
						settingsService.uploadImage(ctrl.settings.beads[color.slug][letter].image, color.slug, letter, ctrl.settings.general.letter_bead_product).then(function success (response) {
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
(function () {
	angular.module('beadConfigSettings').service('beadConfigSettingsService', ['$http', 'Upload', beadConfigSettingsService]);

	function beadConfigSettingsService($http, Upload) {
		var service = this;

		service.getSettings = getSettings;
		service.saveSettings = saveSettings;
		service.getColorLines = getColorLines;
		service.uploadImage = uploadImage;

		function getSettings() {
			return $http({
				method: 'GET',
				url: '/wp-json/bead-config/v1/plugin-settings/'
			});
		}

		function saveSettings(settings) {
			return $http({
				method: 'PUT',
				url: '/wp-json/bead-config/v1/plugin-settings/',
				data: settings
			});
		}

		function getColorLines() {
			return $http({
				method: 'GET',
				url: ''
			});
		}

		function uploadImage(image, color, letter, productId) {
			return Upload.upload({
				url: '/wp-json/bead-config/v1/plugin-settings/image/',
				data: { image: image, color: color, letter: letter, product_id: productId }
			});
		}
	}
})();