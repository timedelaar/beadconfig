﻿(function () {
	angular.module('MdbBeadConfig').directive('mdbBead', ['$rootScope', '$parse', '$timeout', mdbBead]);

	function mdbBead($rootScope, $parse, $timeout) {
		var directive = {
			restrict: 'E',
			require: '^mdbBeadConfig',
			templateUrl: baseUrl + '/Templates/mdbBead.html',
			compile: compileFunc
		};

		return directive;

		function compileFunc(tElement, tAttrs) {
			tElement.addClass('bead');
			return linkFunc;
		}

		function linkFunc(scope, element, attrs, ctrl) {
			var bead = $parse(attrs.bead)(scope);

			scope.setColor = setColor;

			scope.$watch('bead.position', function (position) {
				if (!position)
					return;

				element.width(position.size);
				element.height(position.size);
				element.css({ 'left': position.x + position.correctionX, 'top': position.y + position.correctionY, 'transform': 'rotate(' + position.rotation + 'deg)', 'opacity': 1 });
			}, true);

			//scope.$watch('total', function (newVal, oldVal) {
			//	var x = (scope.index - ((scope.total - 1) / 2)) * 5.7435;
			//	var y = calcY(x);
			//	element.css({ 'top': -y, 'left': x });
			//});

			element.on('click', select);

			function select(e) {
				e.stopPropagation();
				bead.selected = !bead.selected;
				if (bead.selected) {
					element.addClass('selected');
					$rootScope.$emit('beadSelected', bead);
					ctrl.selectedBead = bead;
				}
				else {
					element.removeClass('selected');
					ctrl.selectedBead = null;
				}
				$timeout();
			}

			scope.deselect = function () {
				bead.selected = false;
				element.removeClass('selected');
				if (ctrl.selectedBead === bead) {
					ctrl.selectedBead = null;
				}
				$timeout();
			};

			var closeSelectListener = $rootScope.$on('beadSelected', closeSelector);

			function closeSelector(evt, data) {
				if (bead.selected && data !== bead) {
					scope.deselect();
					scope.$emit('mdbColorSelectorClose');
				}
			}

			function setColor(color) {
				bead.setColor(color);
				//closeSelector();
			}

			scope.$on('$destroy', function () {
				closeSelectListener();
			});
		}
	}
})();