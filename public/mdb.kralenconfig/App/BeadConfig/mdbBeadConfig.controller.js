(function () {
	angular.module('MdbBeadConfig').controller('mdbBeadConfigController', ['$scope', 'beadFactory', 'BeadService', '$window', Controller]);

	function Controller($scope, Bead, beadService, $window) {
		var ctrl = this;

		ctrl.defaultColor = 'army_green';
		ctrl.laceType = 'round';
		ctrl.necklaceText = '';
		ctrl.necklace = [];
		ctrl.prices = {};
		ctrl.amounts = {};
		ctrl.ordered = false;
		ctrl.localStorage = window.localStorage;
		ctrl.baseUrl = baseUrl;

		ctrl.updatePrices = updatePrices;
		ctrl.save = save;
		ctrl.load = load;
		ctrl.addToCart = addToCart;

		load();
		window.onbeforeunload = save;

		$scope.$watchCollection(function () {
			return ctrl.necklace;
		}, function (newVal) {
			updatePrices(newVal);
		});

		function updatePrices(necklace) {
			var total = 0;
			var laceSum = 1;
			var letterBeadsSum = 0;
			var spacerBeadsSmallSum = 0;
			var spacerBeadsBigSum = 0;

			var lace = 1;
			var letterBeads = 0;
			var spacerBeadsSmall = 0;
			var spacerBeadsBig = 0;

			total += laceSum;

			for (var index = 0, length = necklace.length; index < length; index++) {
				var bead = necklace[index];
				total += parseFloat(bead.price);
				switch (bead.type) {
					case 'letter_bead':
						letterBeadsSum += parseFloat(bead.price);
						letterBeads++;
						break;
					case 'spacer_bead':
						if (bead.size === 'big') {
							spacerBeadsBigSum += parseFloat(bead.price);
							spacerBeadsBig++;
						}
						else {
							spacerBeadsSmallSum += parseFloat(bead.price);
							spacerBeadsSmall++;
						}
						break;
				}
			}

			ctrl.prices = {
				total: total.toFixed(2),
				lace: laceSum.toFixed(2),
				letterBeads: letterBeadsSum.toFixed(2),
				spacerBeadsSmall: spacerBeadsSmallSum.toFixed(2),
				spacerBeadsBig: spacerBeadsBigSum.toFixed(2)
			};

			ctrl.amounts = {
				lace: lace,
				letterBeads: letterBeads,
				spacerBeadsSmall: spacerBeadsSmall,
				spacerBeadsBig: spacerBeadsBig
			};
		}

		function reset() {
			ctrl.laceType = 'round';
			ctrl.necklaceText = '';
			ctrl.necklace = [];
			ctrl.prices = {};
			ctrl.amounts = {};
		}

		function save() {
			if (ctrl.ordered || typeof ctrl.localStorage === 'undefined')
				return;

			if (ctrl.necklace.length === 0) {
				ctrl.localStorage.removeItem('necklace');
				return;
			}

			var cookie = {
				laceType: ctrl.laceType,
				necklace: []
			};

			for (var i = 0, l = ctrl.necklace.length; i < l; i++) {
				var bead = ctrl.necklace[i];
				cookie.necklace.push({
					color: bead.color,
					letter: bead.letter
				});
			}

			ctrl.localStorage.setItem('necklace', JSON.stringify(cookie));
		}

		function load() {
			if (typeof ctrl.localStorage === 'undefined') {
				beadService.stopSpinner();
				return;
			}

			var cookie = localStorage.getItem('necklace');
			reset();
			beadService.loading.then(function () {
				ctrl.defaultColor = beadService.getColors()[0];
				if (!cookie) {
					beadService.stopSpinner();
					return;
				}

				cookie = JSON.parse(cookie);
				ctrl.laceType = cookie.laceType;
				for (var i = 0, l = cookie.necklace.length; i < l; i++) {
					var bead = new Bead(beadService.getBead(cookie.necklace[i].color, cookie.necklace[i].letter, ctrl.defaultColor));
					ctrl.necklace.push(bead);
					ctrl.necklaceText += bead.letter;
				}
				beadService.stopSpinner();
			});
		}

		function addToCart() {
			var order = {
				necklace: [],
				laceType: ctrl.laceType
			};
			for (var index = 0, length = ctrl.necklace.length; index < length; index++) {
				var bead = ctrl.necklace[index];
				order.necklace.push({ color: bead.color, letter: bead.letter, variation_id: bead.variation_id });
			}
			beadService.addToCart(order).then(function success(response) {
				ctrl.ordered = true;

				if (typeof ctrl.localStorage === 'undefined')
					return;

				ctrl.localStorage.removeItem('necklace');
				if (!debug)
					$window.location.assign('https://' + $window.location.host + '/cart/');
			}, function error(response) {
				console.log(response);
				throw new Error('Error adding necklace to cart!');
			});
		}
	}
})();