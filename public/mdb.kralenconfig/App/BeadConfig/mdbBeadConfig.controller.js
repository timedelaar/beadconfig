(function () {
	angular.module('MdbBeadConfig').controller('mdbBeadConfigController', ['$scope', '$cookies', 'beadFactory', 'BeadService', '$timeout', Controller]);

	function Controller($scope, $cookies, Bead, beadService) {
		var ctrl = this;

		ctrl.laceType = 'round';
		ctrl.necklaceText = '';
		ctrl.necklace = [];
		ctrl.prices = {};
		ctrl.amounts = {};
		ctrl.ordered = false;

		ctrl.updatePrices = updatePrices;
		ctrl.save = save;
		ctrl.load = load;
		ctrl.order = order;

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
				total += bead.price;
				switch (bead.type) {
					case 'letter_bead':
						letterBeadsSum += bead.price;
						letterBeads++;
						break;
					case 'spacer':
						if (bead.size === 'small') {
							spacerBeadsSmallSum += bead.price;
							spacerBeadsSmall++;
						}
						else {
							spacerBeadsBigSum += bead.price;
							spacerBeadsBig++;
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
			if (ctrl.ordered)
				return;

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

			$cookies.putObject('necklace', cookie);
		}

		function load() {
			var cookie = $cookies.get('necklace');
			if (!cookie)
				return;

			cookie = JSON.parse(cookie);
			reset();
			beadService.loading.then(function () {
				ctrl.laceType = cookie.laceType;
				for (var i = 0, l = cookie.necklace.length; i < l; i++) {
					var bead = new Bead(beadService.getBead(cookie.necklace[i].color, cookie.necklace[i].letter));
					ctrl.necklace.push(bead);
					ctrl.necklaceText += bead.letter;
				}
			});
		}

		function order() {
			ctrl.ordered = true;
			$cookies.remove('necklace');
		}
	}
})();