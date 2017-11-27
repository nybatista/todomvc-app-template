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
				['.new-todo', 'keyup'],
				['#toggle-all', 'click'],
				['button.clear-completed', 'click']
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
		updateCount() {
			const count = document.querySelectorAll('.todo-list li:not(.completed)').length;
			this.todoCountEl.textContent = count;
		}

		onModelAction(p){
			const {action, payload} = p;
			if (action === "INIT_TODOS_EVENT"){
				this.onInitTodos(p.payload);
			} else if (action === "ADD_TODO_EVENT"){
				this.addTodo(payload);
				this.clearInput();
				this.sendEventsDownStream(action,p);

			}
			//this.sendEventsDownStream(action, {});
			console.log("ACTION STRING ",action);

			console.log("TODO EVT ", action, p,this)
		}
		afterRender(){
			this.getChannel("MODEL")
				.subscribe(p => this.onModelAction(p));


			this.getChannel("ROUTE")
				.subscribe(x => console.log("ROUTE ",x));


			this.todoCountEl = document.querySelector('span.todo-count strong');

			new Spyne.ViewStreamBroadcaster(this.settings,this.broadcastEvents);
		}
	}




	Spyne.registerChannel("MODEL", new TodosModel());
	new App({
		el:document.querySelector(".todoapp")
	});



})(window);

