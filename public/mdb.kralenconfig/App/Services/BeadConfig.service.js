(function () {
	'use strict';

	angular.module('MdbBeadConfig').service('BeadService', ['$http', '$q', '$timeout', BeadService]);

	function BeadService($http, $q, $timeout) {
		var service = this;

		var beads;
		var laces = [];

		service.loading;

		service.loadBeads = loadBeads;
		service.getLaces = getLaces;
		service.getBeads = getBeads;
		service.getColors = getColors;
		service.getBeadsByLetter = getBeadsByLetter;
		service.getBeadsByColor = getBeadsByColor;
		service.getBead = getBead;
		service.addToCart = addToCart;
		service.startSpinner = startSpinner;
		service.stopSpinner = stopSpinner;

		loadBeads();

		function loadBeads() {
			startSpinner();
			var source = '/wp-json/bead-config/v1/configurator-data/';
			if (debug) {
				source = 'data/beads.json';
			}
			service.loading = $http({
				method: 'GET',
				url: source
			}).then(function success(response) {
				beads = response.data.beads;
				for (var index = 0, length = response.data.laces.length; index < length; index++) {
					var lace = response.data.laces[index];
					var image = lace.image ? lace.image.thumb_src : lace.image_src;
					laces.push({ 'type': lace.attributes.attribute_pa_veter_type, 'variationId': lace.variation_id, 'image_src': image, 'display_price': lace.display_price });
				}
			}, function error(response) {
				console.log('Error loading beads', response);
			});
			return service.loading;
		}

		function getLaces() {
			return laces;
		}

		function getBeads() {
			return beads;
		}

		function getColors() {
			return Object.keys(beads);
		}

		function getBeadsByLetter(letter) {
			var result = [];
			for (var color in beads) {
				var bead = beads[color][letter];
				if (bead) {
					result.push(bead);
				}
			}
			return result;
		}

		function getBeadsByColor(color) {
			var result = [];
			for (var letter in beads[color]) {
				var bead = beads[color][letter];
				if (bead) {
					result.push(bead);
				}
			}
			return result;
		}

		function getBead(color, letter, backupColor) {
			if (letter === ' ')
				letter = '_';
			letter = letter.toLowerCase();
			if (!beads[color][letter] && backupColor)
				color = backupColor;
			var bead = angular.copy(beads[color][letter]);
			return bead;
		}

		function addToCart(order) {
			if (!debug) {
				return $http({
					method: 'POST',
					url: '/wp-json/bead-config/v1/add-to-cart/',
					data: { necklace: order.necklace, lace_type: order.laceType }
				});
			}

			return $q(function (resolve, reject) {
				$timeout(function () {
				}, 10);
			});
		}

		function startSpinner() {
			var loader = angular.element('<div class="loader-background"><div class="loader"></div>');
			var body = angular.element('body');
			body.append(loader);
		}

		function stopSpinner() {
			angular.element('.loader-background').remove();
		}
	}
})();