(function (window) {
	'use strict';
	// Your starting point. Enjoy the ride!

	//console.log(window.document.readyState);

	new Spyne();

	class App extends Spyne.ViewStream {
		constructor(opts={}){
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
				/*["INIT_TODOS_EVENT", "onInitTodos"]*/
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
			this.sendEventsDownStream(action,p);

			if (action === "INIT_TODOS_EVENT"){
				this.onInitTodos(p.payload);
			} else if (action === "ADD_TODO_EVENT"){
				payload['title'] = payload.val;
				this.addTodo(payload);
				this.clearInput();

			}
			//this.sendEventsDownStream(action, {});
			//console.log("ACTION STRING ",action);

			//console.log("TODO EVT ", action, p,this)
		}

		onRouteChanged(p){
			const routesArr = ['active', 'completed'];
			const classList = this.classList;
			const removeClass = c => classList.remove(c);
			const addClass = c => classList.add(c);
			const hasClass = R.contains(R.__, classList);
			const isSelectedClass = R.equals(R.__, p.data.hashValue);

			const checkState = R.cond([
				[isSelectedClass, addClass],
				[hasClass, removeClass]
			]);
			routesArr.forEach(checkState)

		}


		afterRender(){

			this.classList = this.settings.el.querySelector('ul.todo-list').classList;

			this.getChannel("MODEL")
				.subscribe(p => this.onModelAction(p));


			this.getChannel("ROUTE")
				.subscribe(p => this.onRouteChanged(p));


			this.todoCountEl = document.querySelector('span.todo-count strong');

			new Spyne.ViewStreamBroadcaster(this.settings,this.broadcastEvents);
		}
	}




	Spyne.registerChannel("MODEL", new TodosModel());
	new App({
		el:document.querySelector(".todoapp")
	});



})(window);

