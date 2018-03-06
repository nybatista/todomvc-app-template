(function(window) {
  'use strict';
  console.log('spyne is what ',spyne.SpyneApp);

  const spyneAppConfig = {
  	channels: {
  		ROUTE: {
  			isHash: true,
			  routes: {
  				route: {
  					keyword: 'hashVal'
				  }
			  }
		  }
	  }
  };


  const spyneApp = new spyne.SpyneApp(spyneAppConfig);

  class App extends spyne.ViewStream {
    constructor(props = {}) {
			props['el'] = document.querySelector('.todoapp');
      super(props);

	    console.log('app is ',this);

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
        ['CHANNEL_MODEL_INIT_TODOS_EVENT', 'onInitTodos'],
        ['ADD_TODO_EVENT', 'addTodo'],
        ['UPDATE_TODOS_EVENT', 'downStream'],
        ['DESTROY_TODOS_EVENT', 'onModelAction'],
		      ['CHANNEL_ROUTE_.*', 'onRouteChanged']
      ];
    }

    onInitTodos(p) {
    	console.log('on init todos ',p);
      const payload = p.channelPayload;
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
    	console.log('channel route changed ',p);
/*      const selectedClass = R.defaultTo('', p.data.hashValue);
      this.props.el$.query('ul.todo-list')
        .setClass(`todo-list ${selectedClass}`);
      this.updateMenu(p.data.hashValue);*/
    }

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
	    this.addChannel('ROUTE');
      this.addChannel('MODEL');

    }
  }

  Spyne.registerChannel('MODEL', new TodosModel());
  const app = new App(/*{
    el: document.querySelector('.todoapp')
  }*/);
})(window);
