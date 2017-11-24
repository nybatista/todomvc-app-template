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

		extendedStateMethods(){
			return [
				["INIT_TODOS_EVENT", "onInitTodos"]
			]
		}
		onInitTodos(p){
			p.forEach(this.addTodo.bind(this));
		}

		addTodo(d){
			const data = d;
			this.appendView(new Todo({data}), '.todo-list');
		}
		clearInput(){
			this.settings.el.querySelector('.new-todo').value="";
		}

		onModelAction(p){
			const {action, payload} = p;
			if (action === "INIT_TODOS_EVENT"){
				this.onInitTodos(p.payload);
			} else if (action === "ADD_TODO_EVENT"){
				this.addTodo(payload);
				this.clearInput();
			}
			console.log("TODO EVT ", action, payload)
		}
		afterRender(){
			this.getChannel("MODEL")
				.subscribe(p => this.onModelAction(p));
			new Spyne.ViewStreamBroadcaster(this.settings,this.broadcastEvents);
		}
	}




	Spyne.registerChannel("MODEL", new TodosModel());
	new App({
		el:document.querySelector(".todoapp")
	});



})(window);

