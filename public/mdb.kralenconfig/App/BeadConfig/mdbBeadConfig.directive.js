(function () {
	angular.module('MdbBeadConfig').directive('mdbBeadConfig', ['beadFactory', '$window', '$timeout', mdbBeadConfig]);

	var cx, cy, diameter, paddingLeft, paddingTop, paddingRight, paddingBottom;

	function mdbBeadConfig(Bead, $window, $timeout) {
		var directive = {
			restrict: 'E',
			scope: true,
			templateUrl: '/Templates/mdbBeadConfig.html',
			controller: 'mdbBeadConfigController',
			controllerAs: 'ctrl',
			link: linkFunc
		};

		return directive;

		function linkFunc(scope, element, attrs, ctrl) {
			updatePadding();
			updateCenter();

			scope.fakeBead = new Bead('a');
			scope.fakeBead.position = { x: -1000, y: -1000 };
			element.append('<mdb-bead bead="fakeBead" class="bead"></mdb-bead>')

			scope.$watch('ctrl.necklaceText', convertToBeads);

			scope.$watchCollection('ctrl.necklace', positionBeads);
			angular.element($window).on('resize', function () {
				$timeout(function () {
					updateCenter();
					positionBeads(ctrl.necklace)
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
							necklace[i] = new Bead(text[i]);
						}
						else if (bead.letter !== text[i]) {
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
							bead.position = { x: cx, y: cy };
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
				for (var i = start, l = necklace.length; i < l; i++) {
					var bead = necklace[i];
					var previousX = necklace[i - 1].position.x;
					var previousY = necklace[i - 1].position.y;
					bead.position = getPosition(diameter, previousX, previousY, 1);
				}

				var correction = calculateCorrection(necklace);
				for (var i = 0, l = necklace.length; i < l; i++) {
					var bead = necklace[i];
					bead.position.correctionX = correction.x;
					bead.position.correctionY = correction.y;
					bead.position.size = diameter;
				}
			}

			function updateDiameter(necklace) {
				var beadSize = (cx * 2) / necklace.length;
				var beads = angular.element('mdb-bead');
				if (beads.length > 0) {
					diameter = parseInt(getComputedStyle(beads[0]).width.replace('px', ''));
					var minSize = parseInt(getComputedStyle(beads[0]).minWidth.replace('px', ''));
					var maxSize = parseInt(getComputedStyle(beads[0]).maxWidth.replace('px', ''));
					if (beadSize > minSize && beadSize < maxSize) {
						diameter = beadSize;
					}
				}
			}

			function updateCenter() {
				var necklace = element.find('.necklace');
				if (necklace.length === 0)
					return;

				cx = (angular.element(necklace[0]).width() / 2);
				cy = (angular.element(necklace[0]).height() / 2);
			}

			function calculateCorrection(necklace) {
				var necklaceWidth = (necklace[necklace.length - 1].position.x - cx) * 2 + diameter;
				var windowWidth = (cx * 2) - paddingLeft - paddingRight;
				var correctionX = -(diameter / 2);
				if (necklaceWidth > windowWidth) {
					correctionX += (necklaceWidth / 2) - cx + paddingLeft;
				}

				var windowHeight = (cy * 2) - paddingTop - paddingBottom;
				var necklaceHeight = (cy + (diameter)) - necklace[0].position.y;
				var correctionY = (necklaceHeight / 2) - diameter;
				if (necklaceHeight > windowHeight) {
					correctionY += (necklaceHeight / 2) - cy + paddingTop;
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
			position.x += (precision * direction);
			current = ((-steepness * (position.x - cx) * (position.x - cx)) - (y1 - cy)) * ((-steepness * (position.x - cx) * (position.x - cx)) - (y1 - cy)) + ((position.x - x1) * (position.x - x1));
		}
		position.y = (-steepness * (position.x - cx) * (position.x - cx)) + cy;

		return position;
	}
})();