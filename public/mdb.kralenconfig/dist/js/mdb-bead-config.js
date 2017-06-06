var debug = true;
var baseUrl = '/wp-content/plugins/mdb-kralen-config/public';
if (debug) {
	baseUrl = 'http://localhost:50049/';
}

(function () {
	angular.module('MdbBeadConfig', ['MdbControls']);
})();
(function () {
	angular.module('MdbBeadConfig').controller('mdbBeadConfigController', ['$scope', 'beadFactory', 'BeadService', '$window', Controller]);

	function Controller($scope, Bead, beadService, $window) {
		var ctrl = this;

		ctrl.defaultColor = 'army_green';
		ctrl.laceType = 'round';
		ctrl.necklaceText = '';
		ctrl.necklace = [];
		ctrl.prices = {};
		ctrl.amounts = {};
		ctrl.ordered = false;
		ctrl.localStorage = window.localStorage;
		ctrl.baseUrl = baseUrl;

		ctrl.updatePrices = updatePrices;
		ctrl.save = save;
		ctrl.load = load;
		ctrl.addToCart = addToCart;

		load();
		window.onbeforeunload = save;

		$scope.$watchCollection(function () {
			return ctrl.necklace;
		}, function (newVal) {
			updatePrices(newVal);
		});

		function updatePrices(necklace) {
			var total = 0;
			var laceSum = 1;
			var letterBeadsSum = 0;
			var spacerBeadsSmallSum = 0;
			var spacerBeadsBigSum = 0;

			var lace = 1;
			var letterBeads = 0;
			var spacerBeadsSmall = 0;
			var spacerBeadsBig = 0;

			total += laceSum;

			for (var index = 0, length = necklace.length; index < length; index++) {
				var bead = necklace[index];
				total += parseFloat(bead.price);
				switch (bead.type) {
					case 'letter_bead':
						letterBeadsSum += parseFloat(bead.price);
						letterBeads++;
						break;
					case 'spacer_bead':
						if (bead.size === 'big') {
							spacerBeadsBigSum += parseFloat(bead.price);
							spacerBeadsBig++;
						}
						else {
							spacerBeadsSmallSum += parseFloat(bead.price);
							spacerBeadsSmall++;
						}
						break;
				}
			}

			ctrl.prices = {
				total: total.toFixed(2),
				lace: laceSum.toFixed(2),
				letterBeads: letterBeadsSum.toFixed(2),
				spacerBeadsSmall: spacerBeadsSmallSum.toFixed(2),
				spacerBeadsBig: spacerBeadsBigSum.toFixed(2)
			};

			ctrl.amounts = {
				lace: lace,
				letterBeads: letterBeads,
				spacerBeadsSmall: spacerBeadsSmall,
				spacerBeadsBig: spacerBeadsBig
			};
		}

		function reset() {
			ctrl.laceType = 'round';
			ctrl.necklaceText = '';
			ctrl.necklace = [];
			ctrl.prices = {};
			ctrl.amounts = {};
		}

		function save() {
			if (ctrl.ordered || typeof ctrl.localStorage === 'undefined')
				return;

			if (ctrl.necklace.length === 0) {
				ctrl.localStorage.removeItem('necklace');
				return;
			}

			var cookie = {
				laceType: ctrl.laceType,
				necklace: []
			};

			for (var i = 0, l = ctrl.necklace.length; i < l; i++) {
				var bead = ctrl.necklace[i];
				cookie.necklace.push({
					color: bead.color,
					letter: bead.letter
				});
			}

			ctrl.localStorage.setItem('necklace', JSON.stringify(cookie));
		}

		function load() {
			if (typeof ctrl.localStorage === 'undefined') {
				beadService.stopSpinner();
				return;
			}

			var cookie = localStorage.getItem('necklace');
			reset();
			beadService.loading.then(function () {
				ctrl.defaultColor = beadService.getColors()[0];
				if (!cookie) {
					beadService.stopSpinner();
					return;
				}

				cookie = JSON.parse(cookie);
				ctrl.laceType = cookie.laceType;
				for (var i = 0, l = cookie.necklace.length; i < l; i++) {
					var bead = new Bead(beadService.getBead(cookie.necklace[i].color, cookie.necklace[i].letter, ctrl.defaultColor));
					ctrl.necklace.push(bead);
					ctrl.necklaceText += bead.letter;
				}
				beadService.stopSpinner();
			});
		}

		function addToCart() {
			var order = {
				necklace: [],
				laceType: ctrl.laceType
			};
			for (var index = 0, length = ctrl.necklace.length; index < length; index++) {
				var bead = ctrl.necklace[index];
				order.necklace.push({ color: bead.color, letter: bead.letter, variation_id: bead.variation_id });
			}
			beadService.addToCart(order).then(function success(response) {
				ctrl.ordered = true;

				if (typeof ctrl.localStorage === 'undefined')
					return;

				ctrl.localStorage.removeItem('necklace');
				if (!debug)
					$window.location.assign('https://' + $window.location.host + '/cart/');
			}, function error(response) {
				console.log(response);
				throw new Error('Error adding necklace to cart!');
			});
		}
	}
})();
(function () {
	angular.module('MdbBeadConfig').directive('mdbBeadConfig', ['beadFactory', 'BeadService', '$window', '$timeout', '$rootScope', mdbBeadConfig]);

	var cx, cy, diameter, paddingLeft, paddingTop, paddingRight, paddingBottom;

	function mdbBeadConfig(Bead, beadService, $window, $timeout, $rootScope) {
		var directive = {
			restrict: 'E',
			scope: true,
			templateUrl: baseUrl + '/Templates/mdbBeadConfig.html',
			controller: 'mdbBeadConfigController',
			controllerAs: 'ctrl',
			link: linkFunc
		};

		return directive;

		function linkFunc(scope, element, attrs, ctrl) {
			updatePadding();
			updateCenter();
			beadService.loading.then(function () {
				scope.fakeBead = new Bead(beadService.getBead(ctrl.defaultColor, 'a'));
				scope.fakeBead.position = { x: -1000, y: -1000 };
				element.append('<mdb-bead bead="fakeBead" class="bead"></mdb-bead>');
			});

			scope.$watch('ctrl.necklaceText', convertToBeads);

			scope.$watchCollection('ctrl.necklace', positionBeads);
			angular.element($window).on('resize', function () {
				$rootScope.$broadcast('mdbColorSelectorClose');
				$timeout(function () {
					updateCenter();
					positionBeads(ctrl.necklace);
				});
			});

			function updatePadding() {
				var necklace = element.find('.necklace');
				if (necklace.length === 0)
					return;

				paddingLeft = parseInt(getComputedStyle(necklace[0]).paddingLeft.replace('px', ''));
				paddingTop = parseInt(getComputedStyle(necklace[0]).paddingTop.replace('px', ''));
				paddingRight = parseInt(getComputedStyle(necklace[0]).paddingRight.replace('px', ''));
				paddingBottom = parseInt(getComputedStyle(necklace[0]).paddingBottom.replace('px', ''));
			}

			function convertToBeads(text) {
				if (angular.isDefined(text) && text !== null) {
					var necklace = ctrl.necklace;
					var newLength = text.length;
					if (newLength < necklace.length) {
						necklace.splice(newLength, necklace.length - newLength);
					}
					for (var i = 0, l = newLength; i < l; i++) {
						var bead = necklace[i];
						if (!bead) {
							necklace[i] = new Bead(beadService.getBead(ctrl.defaultColor, text[i]));
						}
						else if (bead.letter !== text[i]) {
							if (bead.letter === '_' && text[i] === ' ')
								continue;
							bead.letter = text[i];
						}
					}
				}
			}

			function positionBeads(necklace) {
				if (!angular.isDefined(necklace) || necklace === null || necklace.length === 0)
					return;


				updateDiameter(necklace);

				var middle = ctrl.necklace.length / 2;
				var start = Math.round(middle);
				for (var i = start - 1; i >= 0; i--) {
					var bead = necklace[i];
					var previousX, previousY;
					if (i === start - 1) {
						if (start !== middle) {
							bead.position = getPosition(0, cx, cy, 1);
						}
						else {
							bead.position = getPosition(diameter / 2, cx, cy, -1);
						}
					}
					else {
						previousX = necklace[i + 1].position.x;
						previousY = necklace[i + 1].position.y;
						bead.position = getPosition(diameter, previousX, previousY, -1);
					}
				}
				for (i = start, l = necklace.length; i < l; i++) {
					bead = necklace[i];
					previousX = necklace[i - 1].position.x;
					previousY = necklace[i - 1].position.y;
					bead.position = getPosition(diameter, previousX, previousY, 1);
				}

				var correction = calculateCorrection(necklace);
				for (i = 0, l = necklace.length; i < l; i++) {
					bead = necklace[i];
					bead.position.correctionX = correction.x;
					bead.position.correctionY = correction.y;
					bead.position.size = diameter;
				}
			}

			function updateDiameter(necklace) {
				var beadSize = (cx * 2 - paddingLeft - paddingRight) / necklace.length;
				var beads = angular.element('mdb-bead.bead');
				if (beads.length > 0) {
					diameter = parseInt(getComputedStyle(beads[0]).width.replace('px', ''));
					var minSize = parseInt(getComputedStyle(beads[0]).minWidth.replace('px', ''));
					var maxSize = parseInt(getComputedStyle(beads[0]).maxWidth.replace('px', ''));
					if (!maxSize) {
						if (cx >= cy) {
							maxSize = cy * 2 - paddingTop - paddingBottom;
						}
						else {
							maxSize = cx * 2 - paddingLeft - paddingRight;
						}
					}
					if (beadSize < minSize) {
						diameter = minSize;
					}
					else if (beadSize > maxSize) {
						diameter = maxSize;
					}
					else {
						diameter = beadSize;
					}
				}
			}

			function updateCenter() {
				var necklace = element.find('.necklace');
				if (necklace.length === 0)
					return;

				cx = angular.element(necklace[0]).width() / 2;
				cy = angular.element(necklace[0]).height() / 2;
			}

			function calculateCorrection(necklace) {
				var necklaceWidth = (necklace[necklace.length - 1].position.x - cx) * 2 + diameter;
				var windowWidth = cx * 2 - paddingLeft - paddingRight;
				var correctionX = -(diameter / 2);
				if (necklaceWidth > windowWidth) {
					correctionX += necklaceWidth / 2 - cx + paddingLeft;
				}

				var windowHeight = cy * 2 - paddingTop - paddingBottom;
				var necklaceHeight = cy + diameter - necklace[0].position.y;
				var correctionY = necklaceHeight / 2 - diameter;
				if (necklaceHeight > windowHeight) {
					correctionY += necklaceHeight / 2 - cy + paddingTop;
				}

				return { x: correctionX, y: correctionY };
			}
		}
	}

	function getPosition(distance, x1, y1, direction) {
		var position = {};
		position.x = x1;
		var steepness = 0.002;
		var precision = 0.1;
		var goal = distance * distance;
		var current = 0;
		while (current < goal) {
			position.x += precision * direction;
			current = (-steepness * (position.x - cx) * (position.x - cx) - (y1 - cy)) * (-steepness * (position.x - cx) * (position.x - cx) - (y1 - cy)) + (position.x - x1) * (position.x - x1);
		}
		position.y = -steepness * (position.x - cx) * (position.x - cx) + cy;
		var dydx = 2 * -steepness * (position.x - cx);
		position.rotation = Math.atan(dydx) * 180 / Math.PI;


		return position;
	}
})();
(function () {
	angular.module('MdbBeadConfig').directive('mdbBead', ['$rootScope', '$parse', mdbBead]);

	function mdbBead($rootScope, $parse) {
		var directive = {
			restrict: 'E',
			controller: function() {}, // Empty controller to allow for require
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
				}
				else {
					element.removeClass('selected');
				}
			}

			scope.deselect = function () {
				bead.selected = false;
				element.removeClass('selected');
			};

			var closeSelectListener = $rootScope.$on('beadSelected', closeSelector);

			function closeSelector (evt, data) {
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
(function () {
	angular.module('MdbBeadConfig').factory('beadFactory', ['BeadService', beadFactory]);

	function beadFactory(beadService) {
		return function Bead(beadPrototype) {
			var bead = this;

			bead.selected = false;

			bead.setColor = setColor;

			for (var key in beadPrototype) {
				bead[key] = angular.copy(beadPrototype[key]);
			}

			function setColor(color, evt) {
				var newPrototype = beadService.getBead(color, bead.letter);
				for (var key in newPrototype) {
					bead[key] = angular.copy(newPrototype[key]);
				}
			}
		};
	}
})();
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
(function () {
	'use strict';

	angular.module('MdbBeadConfig').service('BeadService', ['$http', '$q', '$timeout', BeadService]);

	function BeadService($http, $q, $timeout) {
		var service = this;

		var beads;

		service.loading;

		service.loadBeads = loadBeads;
		service.getBeads = getBeads;
		service.getColors = getColors;
		service.getBeadsByLetter = getBeadsByLetter;
		service.getBeadsByColor = getBeadsByColor;
		service.getBead = getBead;
		service.addToCart = addToCart;
		service.startSpinner = startSpinner;
		service.stopSpinner = stopSpinner;

		loadBeads();

		function loadBeads() {
			startSpinner();
			var source = '/wp-json/bead-config/v1/plugin-settings/';
			if (debug) {
				source = 'data/beads.json';
			}
			service.loading = $http({
				method: 'GET',
				url: source
			}).then(function success(response) {
				beads = response.data.settings.beads;
			}, function error(response) {
				console.log('Error loading beads', response);
			});
			return service.loading;
		}

		function getBeads() {
			return beads;
		}

		function getColors() {
			return Object.keys(beads);
		}

		function getBeadsByLetter(letter) {
			var result = [];
			for (var color in beads) {
				var bead = beads[color][letter];
				if (bead) {
					result.push(bead);
				}
			}
			return result;
		}

		function getBeadsByColor(color) {
			var result = [];
			for (var letter in beads[color]) {
				var bead = beads[color][letter];
				if (bead) {
					result.push(bead);
				}
			}
			return result;
		}

		function getBead(color, letter, backupColor) {
			if (letter === ' ')
				letter = '_';
			letter = letter.toLowerCase();
			if (!beads[color][letter] && backupColor)
				color = backupColor;
			var bead = angular.copy(beads[color][letter]);
			return bead;
		}

		function addToCart(order) {
			if (!debug) {
				return $http({
					method: 'POST',
					url: '/wp-json/bead-config/v1/add-to-cart/',
					data: { necklace: order.necklace, lace_type: order.laceType }
				});
			}

			return $q(function (resolve, reject) {
				$timeout(function () {
				}, 10);
			});
		}

		function startSpinner() {
			var loader = angular.element('<div class="loader-background"><div class="loader"></div>');
			var body = angular.element('body');
			body.append(loader);
		}

		function stopSpinner() {
			angular.element('.loader-background').remove();
		}
	}
})();