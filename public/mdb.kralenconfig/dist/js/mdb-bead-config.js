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

		var cx, cy, ratio, paddingLeft, paddingTop, paddingRight, paddingBottom;
		var oldStart, oldEnd, newStart, newEnd;

		ctrl.selectedBead = null;

		ctrl.defaultColor = 'army_green';
		ctrl.laceType;
		ctrl.necklaceText = '';
		ctrl.necklace = [];
		ctrl.prices = {};
		ctrl.amounts = {};
		ctrl.confirm = false;
		ctrl.displayError = false;
		ctrl.ordered = false;
		ctrl.localStorage = window.localStorage;
		ctrl.baseUrl = baseUrl;

		ctrl.updatePrices = updatePrices;
		ctrl.save = save;
		ctrl.load = load;
		ctrl.addToCart = addToCart;
		ctrl.getLaces = getLaces;

		ctrl.updateCenter = updateCenter;
		ctrl.updatePadding = updatePadding;
		ctrl.positionBeads = positionBeads;

		ctrl.removeBeads = removeBeads;
		ctrl.addBead = addBead;
		ctrl.preventPaste = preventPaste;

		load();
		window.onbeforeunload = save;

		$scope.$watchCollection(function () {
			return ctrl.necklace;
		}, function (newVal) {
			updatePrices(newVal);
		});

		function updatePrices(necklace) {
			var total = 0;
			var laceSum = ctrl.laceType ? ctrl.laceType.display_price : 0;
			var letterBeadsSum = 0;
			var spacerBeadsSmallSum = 0;
			var spacerBeadsBigSum = 0;

			var lace = ctrl.laceType ? 1 : 0;
			var letterBeads = 0;
			var spacerBeadsSmall = 0;
			var spacerBeadsBig = 0;

			total += laceSum;

			for (var index = 0, length = ctrl.necklace.length; index < length; index++) {
				var bead = ctrl.necklace[index];
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
			ctrl.laceType = beadService.getLaces()[0];
			ctrl.necklaceText = '';
			ctrl.necklace = [];
			ctrl.prices = {};
			ctrl.amounts = {};
			ctrl.updatePrices();
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
			beadService.loading.then(function () {
				reset();
				ctrl.defaultColor = beadService.getColors()[0];
				if (typeof ctrl.localStorage === 'undefined') {
					beadService.stopSpinner();
					return;
				}
				var cookie = localStorage.getItem('necklace');
				if (!cookie) {
					beadService.stopSpinner();
					return;
				}

				cookie = JSON.parse(cookie);
				ctrl.laceType = cookie.laceType;
				for (var i = 0, l = cookie.necklace.length; i < l; i++) {
					var bead = new Bead(beadService.getBead(cookie.necklace[i].color, cookie.necklace[i].letter, ctrl.defaultColor));
					ctrl.necklace.push(bead);
					if (bead.letter !== '_')
						ctrl.necklaceText += bead.letter;
					else
						ctrl.necklaceText += ' ';
				}
				beadService.stopSpinner();
			});
		}

		function addToCart(confirmed) {
			if (!ctrl.necklace || ctrl.necklace.length === 0) {
				return;
			}
			if (!confirmed && ctrl.necklace && ctrl.necklace.length > 0) {
				ctrl.displayError = true;
				return;
			}
			if (ctrl.necklace && ctrl.necklace.length > 0) {
				var order = {
					necklace: [],
					laceType: { 'type': ctrl.laceType.type, 'variation_id': ctrl.laceType.variationId }
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

		function getLaces() {
			return beadService.getLaces();
		}

		function updateCenter(element) {
			var necklace = element.find('.necklace');
			if (necklace.length === 0)
				return;

			cx = angular.element(necklace[0]).width() / 2;
			cy = angular.element(necklace[0]).height() / 2;
		}

		function updatePadding(element) {
			var necklace = element.find('.necklace');
			if (necklace.length === 0)
				return;

			paddingLeft = parseInt(getComputedStyle(necklace[0]).paddingLeft.replace('px', ''));
			paddingTop = parseInt(getComputedStyle(necklace[0]).paddingTop.replace('px', ''));
			paddingRight = parseInt(getComputedStyle(necklace[0]).paddingRight.replace('px', ''));
			paddingBottom = parseInt(getComputedStyle(necklace[0]).paddingBottom.replace('px', ''));
		}

		function removeBeads(evt) {
			ctrl.confirm = false;
			ctrl.displayError = false;
			var start = evt.currentTarget.selectionStart;
			var end = evt.currentTarget.selectionEnd;
			if (start === end && evt.which === 8) {
				if (start > 0) {
					ctrl.necklace.splice(start - 1, 1);
				}
			}
			else if (start === end && evt.which === 46) {
				if (start < ctrl.necklace.length) {
					ctrl.necklace.splice(start, 1);
				}
			}
			else {
				ctrl.necklace.splice(start, end - start);
			}
			ctrl.positionBeads(ctrl.necklace);
		}

		function addBead(evt) {
			var start = evt.currentTarget.selectionStart;
			var letter = String.fromCharCode(evt.charCode);
			var bead = new Bead(beadService.getBead(ctrl.defaultColor, letter));
			if (ctrl.necklace.length > 0) {
				bead.position = angular.copy(ctrl.necklace[0].position);
				bead.width = ctrl.necklace[0].width;
				bead.height = ctrl.necklace[0].height;
			}
			ctrl.necklace.splice(start, 0, bead);
			ctrl.positionBeads(ctrl.necklace);
		}

		function preventPaste(evt) {
			evt.preventDefault();
			return false;
		}

		function positionBeads(necklace) {
			if (!angular.isDefined(necklace) || necklace === null || necklace.length === 0)
				return;


			updateRatio(necklace);
			var middle = getMiddleBead(necklace, ratio);
			var start = Math.floor(middle.middleBead);
			for (var i = start; i >= 0; i--) {
				bead = necklace[i];
				var previousX, previousY, distance;
				if (i === start) {
					bead.position = getPosition(middle.offset, cx, cy, Math.sign(middle.offset * -1));
				}
				else {
					previousX = necklace[i + 1].position.x;
					previousY = necklace[i + 1].position.y;
					distance = (bead.originalWidth * ratio + necklace[i + 1].originalWidth * ratio) / 2;
					bead.position = getPosition(distance, previousX, previousY, -1);
				}
			}
			for (i = start + 1, l = necklace.length; i < l; i++) {
				bead = necklace[i];
				previousX = necklace[i - 1].position.x;
				previousY = necklace[i - 1].position.y;
				distance = (bead.originalWidth * ratio + necklace[i - 1].originalWidth * ratio) / 2;
				bead.position = getPosition(distance, previousX, previousY, 1);
			}

			var correction = calculateCorrection(necklace);
			for (i = 0, l = necklace.length; i < l; i++) {
				bead = necklace[i];
				bead.position.correctionX = correction.x;
				bead.position.correctionY = correction.y;
				bead.width = bead.originalWidth * ratio;
				bead.height = bead.originalHeight * ratio;
			}
		}

		function updateRatio(necklace) {
			var space = cx * 2 - paddingLeft - paddingRight;
			var necklaceSize = 0;
			var originalBead = null;
			for (var index = 0, length = necklace.length; index < length; index++) {
				var bead = necklace[index];
				if (bead.originalWidth) {
					necklaceSize += bead.originalWidth;
				}
				if (bead.letter !== '_') {
					originalBead = bead;
				}
			}
			if (!originalBead) {
				originalBead = necklace[0];
			}
			ratio = space / necklaceSize;
			if (originalBead.originalWidth * ratio < originalBead.minWidth) {
				ratio = originalBead.minWidth / originalBead.originalWidth;
			}
			else if (originalBead.originalWidth * ratio > originalBead.maxWidth) {
				ratio = originalBead.maxWidth / originalBead.originalWidth;
			}
		}

		function getMiddleBead(necklace, ratio) {
			var necklaceWidth = 0;
			for (var index = 0, length = necklace.length; index < length; index++) {
				var bead = necklace[index];
				if (!bead.originalWidth) {
					return { middleBead: necklace.length / 2, offset: 0 };
				}
				necklaceWidth += bead.originalWidth * ratio;
			}
			var middle = necklaceWidth / 2;
			var currentLeft = 0;
			for (index = 0, length = necklace.length; index < length; index++) {
				bead = necklace[index];
				var beadWidth = bead.originalWidth * ratio;
				if (currentLeft + beadWidth > middle) {
					return {
						middleBead: index,
						offset: middle - (currentLeft + bead.originalWidth * ratio / 2)
					};
				}
				currentLeft += bead.originalWidth * ratio;
			}
		}

		function calculateCorrection(necklace) {
			var bead = null;
			for (var index = 0, length = necklace.length; index < length; index++) {
				if (necklace[index].letter !== '_') {
					bead = necklace[index];
				}
			}
			if (!bead) {
				bead = necklace[0];
			}
			var necklaceWidth = (bead.position.x - cx) * 2 + bead.originalWidth * ratio;
			var windowWidth = cx * 2 - paddingLeft - paddingRight;
			var correctionX = -(bead.originalWidth * ratio / 2);
			if (necklaceWidth > windowWidth) {
				correctionX += necklaceWidth / 2 - cx + paddingLeft;
			}

			var windowHeight = cy * 2 - paddingTop - paddingBottom;
			var necklaceHeight = cy + bead.originalHeight * ratio - necklace[0].position.y;
			var correctionY = necklaceHeight / 2; //TODO
			if (necklaceHeight > windowHeight) {
				correctionY += necklaceHeight / 2 - cy + paddingTop;
			}

			return { x: correctionX, y: correctionY };
		}

		function getPosition(distance, x1, y1, direction) {
			if (direction === 0) {
				return { x: x1, y: y1, rotation: 0 };
			}
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
	}
})();
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

			angular.element($window).on('resize', function () {
				$timeout(function () {
					ctrl.updateCenter(element);
					ctrl.positionBeads(ctrl.necklace);
				});
			});
		}
	}
})();
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
				if (selectedBead)
					scope.beads = beadService.getBeadsByLetter(selectedBead.letter);
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
(function () {
	'use strict';

	angular.module('MdbBeadConfig').service('BeadService', ['$http', '$q', '$timeout', BeadService]);

	function BeadService($http, $q, $timeout) {
		var service = this;

		var beads;
		var laces = [];

		service.loading;

		service.loadBeads = loadBeads;
		service.getLaces = getLaces;
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
			var source = '/wp-json/bead-config/v1/configurator-data/';
			if (debug) {
				source = 'data/beads.json';
			}
			service.loading = $http({
				method: 'GET',
				url: source
			}).then(function success(response) {
				beads = response.data.beads;
				for (var index = 0, length = response.data.laces.length; index < length; index++) {
					var lace = response.data.laces[index];
					var image = lace.image ? lace.image.thumb_src : lace.image_src;
					laces.push({ 'type': lace.attributes.attribute_pa_veter_type, 'variationId': lace.variation_id, 'image_src': image, 'display_price': lace.display_price });
				}
			}, function error(response) {
				console.log('Error loading beads', response);
			});
			return service.loading;
		}

		function getLaces() {
			return laces;
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