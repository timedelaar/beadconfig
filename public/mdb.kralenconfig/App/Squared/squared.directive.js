(function () {
	'use strict';

	angular.module('Squared', []).directive('squared', [Squared]);

	function Squared() {
		var directive = {
			restrict: 'A',
			link: linkFunc
		};

		return directive;

		function linkFunc(scope, element) {
			var width = element.width();
			element.height(width);
		}
	}
})();