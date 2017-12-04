(function(window) {
  'use strict';
  new Spyne();

  class App extends Spyne.ViewStream {
    constructor(opts = {}) {
      super(opts);
      this.afterRender();
    }
    broadcastEvents() {
      return [
        ['.new-todo', 'keyup'],
        ['#toggle-all', 'click'],
        ['button.clear-completed', 'click']
      ];
    }

    extendedStateMethods() {
      return [
		  ['INIT_TODOS_EVENT', 'onModelInit'],
		  ['ADD_TODO_EVENT', 'onAddTodo'],
		  ['UPDATE_TODOS_EVENT', 'onUpdateTodo'],
		  ['DESTROY_TODOS_EVENT', 'onUpdateTodo']
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
      this.settings.el.querySelector('.new-todo').value = '';
    }

    onModelInit(p) {
      console.log(' p is ', p);

      const {action, payload} = p;
      this.onInitTodos(p.payload);
      this.sendEventsDownStream(action, p);
    }

    onAddTodo(p) {
      console.log(' p is ', p);

      const {action, payload} = p;
      payload['title'] = payload.val;
      this.addTodo(payload);
      this.clearInput();
      this.sendEventsDownStream(action, p);
    }

    onUpdateTodo(p) {
      console.log(' p is ', p);

      const {action, payload} = p;
      this.sendEventsDownStream(action, p);
      this.updateTextCount();
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
        this.settings.el.classList.add('hide-elements');
      } else {
        this.settings.el.classList.remove('hide-elements');
      }

      this.countEl.innerHTML = `<strong>${num}</strong>${itemsStr}`;
    }


    afterRender() {
      this.classList = this.settings.el.querySelector('ul.todo-list').classList;
      this.countEl = document.querySelector('footer span.todo-count');
      this.menuEl = document.querySelectorAll('ul.filters li');
      this.addChannel('MODEL');

      this.getChannel('ROUTE')
        .subscribe(p => this.onRouteChanged(p));
      this.todoCountEl = document.querySelector('span.todo-count strong');
      new Spyne.ViewStreamBroadcaster(this.settings, this.broadcastEvents);
    }
  }

  Spyne.registerChannel('MODEL', new TodosModel());
  new App({
    el:document.querySelector('.todoapp')
  });
})(window);
