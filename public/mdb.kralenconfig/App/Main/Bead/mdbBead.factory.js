(function () {
	angular.module('MdbBeadConfig').factory('beadFactory', [beadFactory]);

	function beadFactory() {
		return function Bead (letter) {
			var bead = this;

			bead.letter = letter;
			bead.selected = false;
		}
	}
})();