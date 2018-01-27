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

    addActionMethods() {
      return [
        ['INIT_TODOS_EVENT', 'onInitTodos'],
        ['ADD_TODO_EVENT', 'addTodo'],
        ['UPDATE_TODOS_EVENT', 'downStream'],
        ['DESTROY_TODOS_EVENT', 'onModelAction'],
		      ['CHANNEL_ROUTE_CHANGE_EVENT', 'onRouteChanged']
      ];
    }

    onInitTodos(p) {
      const payload = p.payload;
      const addTodo = data => this.appendView(new Todo({data}), '.todo-list');
      payload.forEach(addTodo);
    }

    addTodo(p) {
      let data = p.payload;
      data['title'] = data.val;
      this.appendView(new Todo({data}), '.todo-list');
      this.clearInput();
    }

    onRouteChanged(p) {
      const selectedClass = R.defaultTo('', p.data.hashValue);
      this.props.el$.query('ul.todo-list')
        .setClass(`todo-list ${selectedClass}`);
      this.updateMenu(p.data.hashValue);
    }
u
    updateMenu(route = 'home') {
      const selectedItem = `[data-route=${route}]`;
      this.props.el$.query('footer ul li a')
        .setActiveItem(selectedItem, 'selected');
    }

    updateTextCount() {
      const num = document.querySelectorAll('.todo-list li').length;
      const itemsStr = num === 1 ? ' item left' : ' items left';
      this.props.el$.setClassOnBool('hide-elements', num === 0);
      this.counterText.el.innerHTML = `<strong>${num}</strong>${itemsStr}`;
    }

    clearInput() {
      this.props.el$.query('.new-todo').el.value = '';
    }

    onModelAction(p) {
      this.updateTextCount();
    }

    afterRender() {
      this.counterText = this.props.el$.query('footer span.todo-count');
      this.addChannel('MODEL', true);
      this.addChannel('ROUTE');
    }
  }

  Spyne.registerChannel('MODEL', new TodosModel());
  const app = new App({
    el: document.querySelector('.todoapp')
  });
})(window);
