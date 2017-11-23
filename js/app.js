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

	var re =/(\{\{)([\w]+)(\}\})/gm;

	var getStr = (str,p1,p2,p3,p4) => {
		let newStr = data[p2];
		console.log('newString ',newStr,p2);
		return newStr;
	}

	let str = tmpl.replace(re, getStr);
	let el =  new DOMParser().parseFromString(str, 'text/html').body.childNodes[0];

	var todosTmpl = document.querySelector('#test-li');
	console.log("tmpl data ",el,str);

	let myView = new Spyne.DomItem('div', {}, data, todosTmpl);
	//document.body.appendChild(el);
	document.body.appendChild(myView.render());
	console.log("render ",myView.render());

	window.document.addEventListener('DOMContentLoaded', fn);

})(window);
