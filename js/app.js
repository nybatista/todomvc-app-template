(function (window) {
	'use strict';

	// Your starting point. Enjoy the ride!
	console.log(window.document.readyState);

	let fn = (e) => {
			console.log("window state is ",e.target.readyState,R,Rx,spyne);
	};

	window.document.addEventListener('DOMContentLoaded', fn);

})(window);
