(function () {
	angular.module('MdbBeadConfig').directive('mdbBead', ['$rootScope', '$parse', mdbBead]);

	function mdbBead($rootScope, $parse) {
		var directive = {
			restrict: 'E',
			controller: function() {}, // Empty controller to allow for require
			templateUrl: '/Templates/mdbBead.html',
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
				element.css({ 'left': (position.x + position.correctionX), 'top': (position.y + position.correctionY), 'opacity': 1 });
			}, true);

			//scope.$watch('total', function (newVal, oldVal) {
			//	var x = (scope.index - ((scope.total - 1) / 2)) * 5.7435;
			//	var y = calcY(x);
			//	element.css({ 'top': -y, 'left': x });
			//});

			element.on('click', select);

			function select(e) {
				bead.selected = !bead.selected;
				if (bead.selected) {
					element.addClass('selected');
					$rootScope.$emit('beadSelected', bead);
				}
				else {
					element.removeClass('selected');
				}
			}

			scope.deselect = function() {
				bead.selected = false;
				element.removeClass('selected');
			}

			var closeSelectListener = $rootScope.$on('beadSelected', closeSelector);

			function closeSelector (evt, data) {
				if (bead.selected && data !== bead) {
					scope.deselect();
					scope.$emit('mdbColorSelectorClose');
				}
			}

			function setColor(color) {
				bead.setColor(color);
				closeSelector();
			}

			scope.$on('$destroy', function () {
				closeSelectListener();
			});
		}
	}
})();