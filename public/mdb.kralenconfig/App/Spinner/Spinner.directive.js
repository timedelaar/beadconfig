(function () {
	angular.module('Spinner', []).directive('spinner', ['$parse', Spinner]);

	function Spinner($parse) {
		var directive = {
			restrict: 'A',
			link: linkFunc
		};

		return directive;


		function linkFunc(scope, element, attrs) {
			var spinner = angular.element('<div class="spinner"></div>');
			spinner.insertBefore(element);
			element.css({ 'display': 'none' });
			
			element.ready(function (evt) {
				spinner.remove();
				element.css({ 'display': '' });
			});
		}
	}
})();