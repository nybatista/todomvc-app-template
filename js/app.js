(function(window) {
  'use strict';
  console.log('spyne is what ',spyne.SpyneApp);

  const spyneAppConfig = {
  	channels: {
  		WINDOW: {
  			events: ['beforeunload']
		  },

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

    onChildDisposed(o,p){
    	console.log('child has been removed ',o);
    	this.updateTextCount()
    }

    broadcastEvents() {
      return [
        ['.new-todo', 'keyup', 'local'],
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
		      ['CHANNEL_ROUTE_.*', 'onRouteChanged'],
		      ['CHANNEL_UI.*', 'onUIClick']
      ];
    }

    onUIClick(item){
    	const type = R.path(['channelPayload', 'type'], item);
    	const isEnterKey = R.pathEq(['event', 'key' ], 'Enter', item);
    	if (type==='title-new' && isEnterKey === true){
    		const title = R.path(['srcElement', 'el', 'value'], item);
    		const completed = false;
    		this.addTodo({title, completed});

	    }
	    this.updateTextCount();
				console.log('item ',item,type,isEnterKey);
    }

    onInitTodos(p) {
    	console.log('on init todos ',p);
      const payload = p.channelPayload;
      const addTodo = data => this.appendView(new Todo({data}), '.todo-list');
      payload.forEach(addTodo);
    }

    addTodo(data) {
   //   let data =d;
     // data['title'] = data.val;
      this.appendView(new Todo({data}), '.todo-list');
      this.clearInput();
    }

    onRouteChanged(p) {
    	console.log('channel route changed ',p);
      const selectedClass = R.defaultTo('', R.path(['channelPayload', 'routeStr']))(p);
      this.props.el$.query('ul.todo-list')
        .setClass(`todo-list ${selectedClass}`);
      this.updateMenu(selectedClass);
    }

    updateMenu(r) {
    	const route = r === "" ? 'home' : r;
      const selectedItem = `[data-route=${route}]`;
	     this.props.el$.query('footer ul li a')
	     .setActiveItem(selectedItem, 'selected');
    }

    updateTextCount() {
      const num = document.querySelectorAll('.todo-list li').length;
	    console.log('update count ', num);

	    const itemsStr = num === 1 ? ' item left' : ' items left';
      this.props.el$.toggleClass('hide-elements', num === 0);
      this.counterText.el.innerHTML = `<strong>${num}</strong>${itemsStr}`;
	    console.log('update count after ', num);

    }

    clearInput() {
      this.props.el$.query('.new-todo').el.value = '';
    }

    onModelAction(p) {
      this.updateTextCount();
    }

    afterRender() {
      this.counterText = this.props.el$.query('footer span.todo-count');
	    this.addChannel('UI');
	    this.addChannel('ROUTE');
      this.addChannel('MODEL');

    }
  }

  Spyne.registerChannel('MODEL', new TodosModel());
  const app = new App(/*{
    el: document.querySelector('.todoapp')
  }*/);
})(window);
