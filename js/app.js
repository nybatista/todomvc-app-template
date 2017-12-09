(function(window) {
  'use strict';
  new Spyne();

  class App extends Spyne.ViewStream {
    constructor(props = {}) {
      super(props);
      this.afterRender();
    }
    broadcastEvents() {
      return [
        ['.new-todo', 'keyup'],
        ['#toggle-all', 'click'],
        ['button.clear-completed', 'click']
      ];
    }

    onInitTodos(p) {
    	console.log(' p is ', p);
      p.forEach(this.addTodo.bind(this));
    }

    addTodo(d) {
      const data = d;
      this.appendView(new Todo({data}), '.todo-list');
    }
    clearInput() {
      this.props.el.querySelector('.new-todo').value = '';
    }

    onRouteChanged(p) {
      const selectedClass = p.data.hashValue;
      const routesArr = ['active', 'completed'];
      const classList = this.classList;
      const removeClass = c => classList.remove(c);
      const addClass = c => classList.add(c);
      const hasClass = R.contains(R.__, classList);
      const isSelectedClass = R.equals(R.__, selectedClass);

      const checkState = R.cond([
        [isSelectedClass, addClass],
        [hasClass, removeClass]
      ]);
      routesArr.forEach(checkState);
      this.updateMenu(selectedClass);
    }

    updateMenu(route = 'home') {
      const selector = `footer ul li a[data-route=${route}]`;
      let removeSelected = el => el.classList.remove('selected');
      document.querySelectorAll('footer ul li a').forEach(removeSelected);

      document.querySelectorAll(selector)[0].classList.add('selected');
    }
    updateTextCount() {
      const num = document.querySelectorAll('.todo-list li').length;
      const itemsStr = num <= 1 ? ' item left' : ' items left';

      if (num === 0) {
        this.props.el.classList.add('hide-elements');
      } else {
        this.props.el.classList.remove('hide-elements');
      }

      this.countEl.innerHTML = `<strong>${num}</strong>${itemsStr}`;
    }

	  onModelAction(p) {
		  const {action, payload} = p;
		  this.sendEventsDownStream(action, p);
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
      this.classList = this.props.el.querySelector('ul.todo-list').classList;
      this.countEl = document.querySelector('footer span.todo-count');
      this.menuEl = document.querySelectorAll('ul.filters li');
      this.getChannel('MODEL')
		  .subscribe(p => this.onModelAction(p));
      this.getChannel('ROUTE')
        .subscribe(p => this.onRouteChanged(p));
      this.todoCountEl = document.querySelector('span.todo-count strong');
      new Spyne.ViewStreamBroadcaster(this.props, this.broadcastEvents);
    }
  }

  Spyne.registerChannel('MODEL', new TodosModel());
  new App({
    el:document.querySelector('.todoapp')
  });
})(window);
