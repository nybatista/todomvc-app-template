(function (window) {
	'use strict';
	// Your starting point. Enjoy the ride!

	console.log(window.document.readyState);

	new Spyne();

	class App extends Spyne.ViewStream {

		constructor(opts={}){
			console.log("opts is ",opts);
			super(opts);
			this.afterRender();
		}
		afterRender(){
			console.log("after render app ",this.settings);
			let logger = x => { console.log('x is ',x); }
			this.getChannel("MODEL")
				.subscribe(logger);
		}
	}

	Spyne.registerChannel("MODEL", new TodosModel());
	new App({
		el:document.querySelector(".todoapp")
	});


})(window);

/*
	var todosTmpl = document.querySelector('#test-li');

	const data = {
		label: 'tater',
		val: 'tot'
	};
	var myView = new spyne.DomItem('div', {}, data, todosTmpl);
	document.body.appendChild(myView.render());
*/


