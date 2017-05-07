(function () {
	angular.module('MdbBeadConfig').controller('mdbBeadConfigController', ['$scope', Controller]);

	function Controller($scope) {
		var ctrl = this;

		ctrl.necklaceText = '';
		ctrl.necklace = [];
		ctrl.prices = {};
		ctrl.amounts = {};

		$scope.$watchCollection(function () {
			return ctrl.necklace;
		}, function (newVal) {
			updatePrices(newVal);
		});

		function updatePrices(necklace) {
			var total = 0;
			var letterBeadsSum = 0;
			var spacerBeadsSmallSum = 0;
			var spacerBeadsBigSum = 0;

			var letterBeads = 0;
			var spacerBeadsSmall = 0;
			var spacerBeadsBig = 0;

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
				letterBeads: letterBeadsSum.toFixed(2),
				spacerBeadsSmall: spacerBeadsSmallSum.toFixed(2),
				spacerBeadsBig: spacerBeadsBigSum.toFixed(2)
			};

			ctrl.amounts = {
				letterBeads: letterBeads,
				spacerBeadsSmall: spacerBeadsSmall,
				spacerBeadsBig: spacerBeadsBig
			};
		}
	}
})();