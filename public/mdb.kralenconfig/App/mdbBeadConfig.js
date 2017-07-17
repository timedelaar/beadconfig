var debug = true;
var baseUrl = '/wp-content/plugins/mdb-kralen-config/public';
if (debug) {
	baseUrl = 'http://localhost:50049/';
}

(function () {
	angular.module('MdbBeadConfig', ['MdbControls']);
})();