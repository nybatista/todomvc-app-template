class Todo extends spyne.ViewStream  {

	constructor(opts={}) {
		opts.tagName = 'li';
		opts.tmpl = document.querySelector('.todo-tmpl');
		opts.className = ['editing'];
		super(opts);
		this.id = opts.data.id;
		this.title = opts.data.title;

	}


	broadcastEvents(){
		return [
			['div', 'dblClick']
		]
	}

	extendedStateMethods(){
		return [
			["PARENT_ADD_TODO_EVENT", "onTodosEvent"]

		]
	}

	onTodosEvent(p) {
		console.log("todos in TODO is ",p,this.id,this.title);
	}

	afterRender(){
		this.settings.el.classList.add('editieng');
		//this.settings.el.dataset['num'] = Math.random();

	}


}
