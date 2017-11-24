class Todo extends spyne.ViewStream  {

	constructor(opts={}) {
		opts.tagName = 'li';
		opts.tmpl = document.querySelector('.todo-tmpl')
		super(opts);
	}

	afterRender(){

	}


}
