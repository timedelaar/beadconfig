﻿(function () {
	'use strict';

	angular.module('MdbBeadConfig').service('BeadService', ['$http', BeadService]);

	function BeadService($http) {
		var service = this;

		var beads;

		service.getBeads = getBeads;
		service.getColorLines = getColorLines;
		service.getBeadsByLetter = getBeadsByLetter;
		service.getBeadsByColor = getBeadsByColor;
		service.getBead = getBead;

		loadBeads();

		function loadBeads() {
			return $http({
				method: 'GET',
				url: '/App/Services/beads.json'
			}).then(function success(response) {
				beads = response.data;
			}, function error(response) {
				console.log('Error loading beads', response);
			});
		}

		function getBeads() {
			return beads;
		}

		function getColorLines() {
			return beads.keys();
		}

		function getBeadsByLetter(letter) {
			var result = [];
			for (var color in beads) {
				var bead = beads[color][letter];
				result.push(bead);
			}
			return result
		}

		function getBeadsByColor(color) {
			var result = [];
			for (var letter in beads[color]) {
				var bead = beads[color][letter];
				result.push(bead);
			}
			return result;
		}

		function getBead(color, letter) {
			var bead = angular.copy(beads[color][letter]);
			return bead;
		}
	}
})();