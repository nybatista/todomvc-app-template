(function (window) {
	'use strict';
	// Your starting point. Enjoy the ride!
	console.log(window.document.readyState);
	const data = {
		label: 'tater',
		val: 'tot'
	};

	const spyneApp = new Spyne();
	var todosTmpl = document.querySelector('#test-li');
	var myView = new spyne.DomItem('div', {}, data, todosTmpl);
	document.body.appendChild(myView.render());

})(window);
