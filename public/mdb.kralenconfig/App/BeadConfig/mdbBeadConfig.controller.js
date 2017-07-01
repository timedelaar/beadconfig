﻿(function () {
	angular.module('MdbBeadConfig').controller('mdbBeadConfigController', ['$scope', 'beadFactory', 'BeadService', '$window', Controller]);

	function Controller($scope, Bead, beadService, $window) {
		var ctrl = this;

		var cx, cy, ratio, paddingLeft, paddingTop, paddingRight, paddingBottom;

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
		ctrl.convertToBeads = convertToBeads;
		ctrl.positionBeads = positionBeads;

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

		function convertToBeads(text) {
			ctrl.confirm = false;
			ctrl.displayError = false;
			if (angular.isDefined(text) && text !== null) {
				ctrl.imagesLoaded = 0;
				var necklace = ctrl.necklace;
				var newLength = text.length;
				if (newLength < necklace.length) {
					necklace.splice(newLength, necklace.length - newLength);
				}
				for (var i = 0, l = newLength; i < l; i++) {
					var bead = necklace[i];
					var letter = text[i];
					if (!bead) {
						necklace[i] = new Bead(beadService.getBead(ctrl.defaultColor, letter));
					}
					else if (bead.letter !== letter) {
						if (bead.letter === '_' && letter === ' ')
							continue;
						var newBead = new Bead(beadService.getBead(bead.color, letter));
						bead.letter = newBead.letter;
						bead.image_location = newBead.image_location;
					}
				}
			}
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