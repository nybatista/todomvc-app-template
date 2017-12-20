(function(window) {
  'use strict';
	const spyne = new Spyne();

  class App extends Spyne.ViewStream {
    constructor(props = {}) {
      super(props);
    }
    broadcastEvents() {
      return [
        ['.new-todo', 'keyup'],
        ['#toggle-all', 'click'],
        ['button.clear-completed', 'click']
      ];
    }
    onInitTodos(p) {
      p.forEach(this.addTodo.bind(this));
    }

    addTodo(data) {
      this.appendView(new Todo({data}), '.todo-list');
    }
    clearInput() {
			this.props.el$.query('.new-todo').el.value = '';
    }

    onRouteChanged(p) {
    	const selectedClass = R.defaultTo('', p.data.hashValue);
			this.props.el$.query('ul.todo-list').
					setClass(`todo-list ${selectedClass}`);
    	this.updateMenu(p.data.hashValue);
    }

    updateMenu(route = 'home') {
      const selectedItem = `[data-route=${route}]`;
			this.props.el$.query('footer ul li a').
					setActiveItem(selectedItem, 'selected');
    }
    updateTextCount() {
      const num = document.querySelectorAll('.todo-list li').length;
      const itemsStr = num === 1 ? ' item left' : ' items left';
			this.props.el$.setClassOnBool('hide-elements', num === 0);
			this.counterText.el.innerHTML = `<strong>${num}</strong>${itemsStr}`;
    }

		onModelAction(p) {
			const {action, payload} = p;
			this.sendEventsDownStream(p);
			if (action === 'INIT_TODOS_EVENT') {
				this.onInitTodos(p.payload);
			} else if (action === 'ADD_TODO_EVENT') {
				payload['title'] = payload.val;
				this.addTodo(payload);
				this.clearInput();
			}
			this.updateTextCount();
    }

    afterRender() {
			this.counterText = this.props.el$.query('footer span.todo-count');
      this.getChannel('MODEL')
		  .subscribe(p => this.onModelAction(p));
      this.getChannel('ROUTE')
        .subscribe(p => this.onRouteChanged(p));
    }
  }

  Spyne.registerChannel('MODEL', new TodosModel());
	const app = new App({
    el:document.querySelector('.todoapp')
  });
})(window);
