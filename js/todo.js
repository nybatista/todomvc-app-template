class Todo extends spyne.ViewStream  {

	constructor(opts={}) {
		opts.tagName = 'li';
		opts.tmpl = document.querySelector('.todo-tmpl');
		super(opts);
		this.id = opts.data.id;
		this.title = opts.data.title;
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

	}


}
