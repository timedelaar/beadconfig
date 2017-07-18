(function () {
	angular.module('MdbBeadConfig').directive('mdbColorSelector', ['BeadService', '$rootScope', mdbColorSelector]);

	function mdbColorSelector(beadService, $rootScope) {
		var directive = {
			restrict: 'E',
			priority: 10,
			scope: true,
			require: '^mdbBeadConfig',
			templateUrl: function (element, attrs) {
				if (!attrs.templateUrl)
					throw new Error('No template url provided!');

				return baseUrl + attrs.templateUrl;
			},
			link: linkFunc
		};

		return directive;

		function linkFunc(scope, element, attrs, ctrl) {
			scope.beads = [];
			scope.$watch('ctrl.selectedBead', function (selectedBead) {
				if (selectedBead) {
					scope.beads = beadService.getBeadsByLetter(selectedBead.letter);
					scope.beads.sort(function (bead1, bead2) {
						return bead1.order - bead2.order;
					});
				}
			});

			element.find('.content-wrap').on('click', function (evt) {
				evt.stopPropagation();
			});

			scope.close = function () {
				$rootScope.$emit('beadSelected');
			};
		}
	}
})();