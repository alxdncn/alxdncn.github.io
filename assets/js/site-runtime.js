(function () {
	'use strict';

	var scripts = [
		'assets/js/jquery.min.js',
		'assets/js/jquery.poptrox.min.js',
		'assets/js/main.js'
	];

	function loadNext() {
		var source = scripts.shift();
		if (!source) return;

		var script = document.createElement('script');
		script.src = source;
		script.onload = loadNext;
		document.body.appendChild(script);
	}

	loadNext();
})();
