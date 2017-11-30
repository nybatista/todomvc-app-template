class Todo extends spyne.ViewStream  {

	constructor(opts={}) {
		opts.tagName = 'li';
		opts.tmpl = document.querySelector('.todo-tmpl');
		opts['class'] = ['todos'];
		opts['dataset'] = opts.data;
		super(opts);
		this.id = opts.data.id;
		this.title = opts.data.title;

	}


	broadcastEvents(){
		return [
			['div', 'dblClick'],
			['input.edit', 'keyup'],
			['input.toggle', 'click'],
			['button.destroy', 'click']




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

	changeEditState(bool=false) {
	/*	 if (bool === true) {
			 this.settings.el.classList.add('editing')
		 } else {
			 this.settings.el.classList.remove('editing')
		 }*/
		this.settings.el.classList.toggle('editing');
		 window.theEl = this.settings.el;
	}

	afterRender(){
		//this.settings.el.classList.add('editieng');
		//console.log(" after render ",this.settings.id);
		if (this.settings.data.completed===true){
			this.settings.el.classList.add('completed');
		}

		let filterLocalUIEvents = p => p.data.cid === this.settings.id && p.data.event === 'dblClick';

		this.getChannel('UI')
			// .do(x => console.log(x))
			.filter(filterLocalUIEvents)
			.subscribe((p) =>this.changeEditState(true));


	}


}
