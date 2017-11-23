(function (window) {
	'use strict';

	// Your starting point. Enjoy the ride!
	console.log(window.document.readyState);

	let fn = (e) => {
			console.log("window state is ",e.target.readyState,R,Rx,spyne);
	};

	const data = {
		label: 'tater',
		val: 'tot'
	};

	let tmpl = document.querySelector('#test-li').text;
	console.log("tmpl data ",tmpl,data);

	let myView = new Spyne.DomItem('h1', data,tmpl);
	document.body.appendChild(myView.render());

	window.document.addEventListener('DOMContentLoaded', fn);

})(window);
