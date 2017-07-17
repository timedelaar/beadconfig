(function () {
	angular.module('MdbBeadConfig').directive('mdbBead', ['$rootScope', '$parse', '$timeout', mdbBead]);

	function mdbBead($rootScope, $parse, $timeout) {
		var directive = {
			restrict: 'E',
			require: '^mdbBeadConfig',
			templateUrl: baseUrl + '/templates/mdbBead.html',
			compile: compileFunc
		};

		return directive;

		function compileFunc(tElement, tAttrs) {
			tElement.addClass('bead');
			return linkFunc;
		}

		function linkFunc(scope, element, attrs, ctrl) {
			var bead = $parse(attrs.bead)(scope);
			element.css({ 'opacity': 0 });

			element.find('img').on('load', function (evt) {
				bead.originalWidth = evt.target.naturalWidth;
				bead.originalHeight = evt.target.naturalHeight;
				ctrl.positionBeads(ctrl.necklace);
				scope.$apply();
			});

			bead.maxWidth = parseInt(element.css('max-width').replace('px', ''));
			bead.minWidth = parseInt(element.css('min-width').replace('px', ''));

			if (bead.letter === '_') {
				element.css('min-width', 'unset');
				element.addClass('small');
			}

			scope.setColor = setColor;

			scope.$watch('bead.letter', function (newLetter, oldLetter) {
				if (newLetter === '_') {
					element.css('min-width', 'unset');
					element.addClass('small');
					bead.maxWidth = parseInt(element.css('max-width').replace('px', ''));
				}
				else if (oldLetter === '_') {
					element.css('min-width', bead.minWidth + 'px');
					element.removeClass('small');
					bead.maxWidth = parseInt(element.css('max-width').replace('px', ''));
				}
			});

			scope.$watch('bead.position', function (position) {
				if (!position)
					return;

				element.width(bead.width);
				element.height(bead.height);
				element.css({ 'left': position.x + position.correctionX - bead.width / 2, 'top': position.y + position.correctionY - bead.height, 'transform': 'rotate(' + position.rotation + 'deg)', 'opacity': 1 });
			}, true);

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
				ctrl.positionBeads(ctrl.necklace);
			});
		}
	}
})();