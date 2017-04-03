var rootUrl = "/wordpress/wp-content/plugins/mdb-kralen-config/includes/app/";

(function () {
    angular.module("BeadConfig", []).directive("beadConfig", [beadConfig]);
    
    function beadConfig () {
	return {
	    restrict: "E",
	    templateUrl: rootUrl + "bead-config.html",
	    controller: "BeadConfigController",
	    controllerAs: "ctrl"
	};
    }
})();