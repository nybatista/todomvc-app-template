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
		broadcastEvents(){
			return [
				['.new-todo', 'keyup']
			]
		}
		afterRender(){
			console.log("after render app ",this.settings);
			let logger = x => { console.log('x is ',x); }
			this.getChannel("MODEL")
				.subscribe(logger);
			new Spyne.ViewStreamBroadcaster(this.settings,this.broadcastEvents);
		}
	}




	Spyne.registerChannel("MODEL", new TodosModel());
	new App({
		el:document.querySelector(".todoapp")
	});



})(window);

