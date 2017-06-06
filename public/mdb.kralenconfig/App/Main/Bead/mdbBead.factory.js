(function () {
	angular.module('MdbBeadConfig').factory('beadFactory', ['BeadService', beadFactory]);

	function beadFactory(beadService) {
		return function Bead(beadPrototype) {
			var bead = this;

			bead.selected = false;

			bead.setColor = setColor;

			for (var key in beadPrototype) {
				bead[key] = angular.copy(beadPrototype[key]);
			}

			function setColor(color, evt) {
				var newPrototype = beadService.getBead(color, bead.letter);
				for (var key in newPrototype) {
					bead[key] = angular.copy(newPrototype[key]);
				}
			}
		};
	}
})();