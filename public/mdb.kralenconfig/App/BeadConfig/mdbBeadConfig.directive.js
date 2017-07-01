(function () {
	angular.module('MdbBeadConfig').directive('mdbBeadConfig', ['beadFactory', 'BeadService', '$window', '$timeout', '$rootScope', mdbBeadConfig]);
	
	function mdbBeadConfig(Bead, beadService, $window, $timeout, $rootScope) {
		var directive = {
			restrict: 'E',
			scope: true,
			templateUrl: baseUrl + '/templates/mdbBeadConfig.html',
			controller: 'mdbBeadConfigController',
			controllerAs: 'ctrl',
			link: linkFunc
		};

		return directive;

		function linkFunc(scope, element, attrs, ctrl) {
			ctrl.updatePadding(element);
			ctrl.updateCenter(element);

			angular.element('body').on('click', function () {
				$rootScope.$emit('beadSelected');
			});

			scope.$watch('ctrl.necklaceText', ctrl.convertToBeads);

			angular.element($window).on('resize', function () {
				$timeout(function () {
					ctrl.updateCenter(element);
					ctrl.positionBeads(ctrl.necklace);
				});
			});
		}
	}
})();