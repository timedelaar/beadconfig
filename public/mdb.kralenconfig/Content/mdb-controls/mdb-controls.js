(function () {
	angular.module('MdbControls', []);

	angular.module('MdbControls').directive('mdbCheckbox', [mdbCheckbox]);
	angular.module('MdbControls').directive('mdbRadio', [mdbRadio]);

	function mdbCheckbox() {
		var directive = {
			restrict: 'A',
			compile: function (iElement, iAttrs) {
				var styleLabel = angular.element('<label class="mdb-control-label"></label>');
				styleLabel.insertAfter(iElement);
			}
		};

		return directive;
	}

	function mdbRadio() {
		var directive = {
			restrict: 'A',
			compile: function (iElement, iAttrs) {
				var styleLabel = angular.element('<label class="mdb-control-label"></label>');
				styleLabel.insertAfter(iElement);
			}
		};

		return directive;
	}
})();