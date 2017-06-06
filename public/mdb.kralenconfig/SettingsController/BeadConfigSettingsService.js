(function () {
	angular.module('beadConfigSettings').service('beadConfigSettingsService', ['$http', 'Upload', beadConfigSettingsService]);

	function beadConfigSettingsService($http, Upload) {
		var service = this;

		service.getSettings = getSettings;
		service.saveSettings = saveSettings;
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

		function uploadImage(image, color, letter, productId) {
			return Upload.upload({
				url: '/wp-json/bead-config/v1/plugin-settings/image/',
				data: { image: image, color: color, letter: letter, product_id: productId }
			});
		}
	}
})();