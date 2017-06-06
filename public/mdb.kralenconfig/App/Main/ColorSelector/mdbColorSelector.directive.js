(function () {
	angular.module('MdbBeadConfig').directive('mdbColorSelector', ['$compile', '$parse', 'BeadService', mdbColorSelector]);
	angular.module('MdbBeadConfig').directive('mdbColorSelectorWindow', [mdbColorSelectorWindow]);

	function mdbColorSelector($compile, $parse, beadService) {
		var directive = {
			restrict: 'A',
			priority: 10,
			require: '^mdbBeadConfigController',
			templateUrl: function (element, attrs) {
				if (!attrs.mdbColorSelector)
					throw new Error('No template url provided!');

				return attrs.mdbColorSelector;
			},
			link: linkFunc
		};

		return directive;

		function linkFunc(scope, element, attrs) {
			scope.selectedBead = scope.bead;
			scope.beads = beadService.getBeadsByLetter(scope.selectedBead.letter);
			//var windowTemplateUrl = baseUrl + attrs.mdbColorSelector;
			//var windowOpen = false;

			//var onCloseCallback = attrs.mdbColorSelectorClose;

			var offsetX = attrs.mdbColorSelectorOffsetX;
			offsetX = offsetX ? parseInt(offsetX) : 0;
			var offsetY = attrs.mdbColorSelectorOffsetY;
			offsetY = offsetY ? parseInt(offsetY) : 0;

			//scope.$on('mdbColorSelectorClose', closeWindow);
			//scope.$on('mdbColorSelectorOpen', openWindow);
			//scope.$on('mdbColorSelectorToggle', toggleWindow);

			//if (!windowTemplateUrl) {
			//	throw new Error('No window template url provided!');
			//}

			//var colorSelectorWindow = angular.element('<mdb-color-selector-window mdb-template-url="' + windowTemplateUrl + '"></mdb-color-selector-window>');

			//element.on('click', toggleWindow);

			//function toggleWindow() {
			//	if (windowOpen)
			//		closeWindow();
			//	else
			//		openWindow();
			//}

			//function openWindow() {
			//	angular.element('body').on('click.selector', closeWindow);
			//	windowOpen = true;
			//	var position = element.position();
			//	colorSelectorWindow.css({ 'left': Math.round(position.left + offsetX) + 'px', 'z-index': 10, 'opacity': 0 });
			//	colorSelectorWindow.insertAfter(element);
			//	position.top -= colorSelectorWindow.height();
			//	position.top = Math.max(position.top, 0);
			//	colorSelectorWindow.css({ 'top': Math.round(position.top + offsetY), 'opacity': 1 });
			//	$compile(colorSelectorWindow)(scope);
			//}

			//function closeWindow() {
			//	angular.element('body').off('click.selector');
			//	windowOpen = false;
			//	colorSelectorWindow.css({ 'opacity': 0 });
			//	angular.element('body').on("webkitTransitionEnd.selectorAnimation otransitionend.selectorAnimation oTransitionEnd.selectorAnimation msTransitionEnd.selectorAnimation transitionend.selectorAnimation", function (event) {
			//		angular.element('body').off('.selectorAnimation');
			//		colorSelectorWindow.remove();
			//	});
			//	if (onCloseCallback) {
			//		scope.$eval(onCloseCallback);
			//	}
			//}
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
			element.on('click', function (evt) {
				evt.stopPropagation();
			});
			element.find('.fa-close, .glyphicon-remove').on('click', function () {
				scope.$emit('mdbColorSelectorClose');
			});
		}
	}
})();