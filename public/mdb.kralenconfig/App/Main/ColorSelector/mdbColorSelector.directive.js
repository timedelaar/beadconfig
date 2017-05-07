(function () {
	angular.module('MdbBeadConfig').directive('mdbColorSelector', ['$compile', '$parse', 'BeadService', mdbColorSelector]);
	angular.module('MdbBeadConfig').directive('mdbColorSelectorWindow', [mdbColorSelectorWindow]);

	function mdbColorSelector($compile, $parse, beadService) {
		var directive = {
			restrict: 'A',
			priority: 10,
			require: 'mdbBead',
			link: linkFunc
		};

		return directive;

		function linkFunc(scope, element, attrs) {
			var bead = scope.bead;
			scope.colorLines = beadService.getBeadsByLetter(bead.letter);
			var windowTemplateUrl = attrs.mdbColorSelector;
			var windowOpen = false;

			var onCloseCallback = attrs.mdbColorSelectorClose;

			var offsetX = attrs.mdbColorSelectorOffsetX;
			offsetX = offsetX ? parseInt(offsetX) : 0;
			var offsetY = attrs.mdbColorSelectorOffsetY;
			offsetY = offsetY ? parseInt(offsetY) : 0;

			scope.$on('mdbColorSelectorClose', closeWindow);
			scope.$on('mdbColorSelectorOpen', openWindow);
			scope.$on('mdbColorSelectorToggle', toggleWindow);

			if (!windowTemplateUrl) {
				throw new Error('No window template url provided!');
			}

			var colorSelectorWindow = angular.element('<mdb-color-selector-window mdb-template-url="' + windowTemplateUrl + '"></mdb-color-selector-window>');

			element.on('click', toggleWindow);

			function toggleWindow() {
				if (windowOpen)
					closeWindow();
				else
					openWindow();
			}

			function openWindow() {
				windowOpen = true;
				var position = element.position();
				colorSelectorWindow.css({ 'left': position.left + offsetX + 'px', 'z-index': 10, 'opacity': 0 });
				colorSelectorWindow.insertAfter(element);
				position.top -= colorSelectorWindow.height();
				colorSelectorWindow.css({ 'top': position.top + offsetY, 'opacity': 1 });
				$compile(colorSelectorWindow)(scope);
			}

			function closeWindow() {
				windowOpen = false;
				colorSelectorWindow.css({ 'opacity': 0 });
				$(this).on("webkitTransitionEnd.selectorAnimation otransitionend.selectorAnimation oTransitionEnd.selectorAnimation msTransitionEnd.selectorAnimation transitionend.selectorAnimation", function (event) {
					colorSelectorWindow.remove();
					$(this).off('.selectorAnimation');
				});
				if (onCloseCallback) {
					scope.$eval(onCloseCallback);
				}
			}
		}
	}

	function mdbColorSelectorWindow() {
		var directive = {
			restrict: 'E',
			templateUrl: function (element, attrs) {
				if (!attrs.mdbTemplateUrl)
					throw new Error('No template url provided!');

				return attrs.mdbTemplateUrl;
			},
			link: linkFunc
		};

		return directive;

		function linkFunc(scope, element, attrs) {
			element.find('.fa-close').on('click', function () {
				scope.$emit('mdbColorSelectorClose');
			});
		}
	}
})();