class Todo extends spyne.ViewStream {
  constructor(opts = {}) {
    opts.tagName = 'li';
    opts.tmpl = document.querySelector('.todo-tmpl');
    opts['class'] = ['todos'];

    R.when(
      R.propEq('key', 'title'),
      R.assoc('title', 'val')
    )(opts.data);

    opts['dataset'] = opts.data;
    super(opts);
    this.id = opts.data.id;
    this.title = opts.data.title;
  }

  broadcastEvents() {
    return [
      ['div', 'dblClick'],
      ['input.edit', 'keyup'],
      ['input.toggle', 'click'],
      ['button.destroy', 'click']

    ];
  }

  extendedStateMethods() {
    return [
      ['PARENT_UPDATE_TODOS_EVENT', 'onTodosEvent'],
     		['PARENT_DESTROY_TODOS_EVENT', 'onRemoveTodosEvent'],
		['PARENT_PARENT_UPDATE_TODOS_EVENT', 'onTodosEvent'],
		['PARENT_PARENT_DESTROY_TODOS_EVENT', 'onRemoveTodosEvent']

    ];
  }

  onRemoveTodosEvent(p) {
	  //console.log("TODOS LISTEN REMOVE ",p);

	  let isLocalUpdateFilter = R.contains(this.id, p.payload.id);
    if (isLocalUpdateFilter === true) {
      this.ui$.unsubscribe();
      this.onDispose();
    }
  }

  onTodosEvent(p) {
  	//console.log("TODOS LISTEN UPDATE",p);
    let isLocalUpdateFilter = R.contains(this.id, p.payload.id);

    if (isLocalUpdateFilter === true) {
      this.updateDom(p.payload.key, p.payload.val);
    }
  }

  updateDom(k, v) {
    const cList = this.settings.el.classList;

    if (k === 'completed') {
      this.settings.data.completed = v;
      const classUpdate = v === true ? R.invoker(1, 'add') : R.invoker(1, 'remove');
      classUpdate(k, cList);
      this.updateCheckBox();
    } else if (k === 'title') {
      const label = this.settings.el.querySelector('div label');
      label.textContent = v;
      cList.remove('editing');
    }
  }

  changeEditState(bool = false) {
    this.settings.el.classList.toggle('editing');
  }

  updateCheckBox() {
    this.settings.el.querySelector('input.toggle').checked = this.settings.data.completed;
  }

  afterRender() {
    if (this.settings.data.completed === true) {
      this.settings.el.classList.add('completed');
    }

    this.updateCheckBox();
    let filterLocalUIEvents = p => p.data.cid === this.settings.id && p.data.event === 'dblClick';

    this.ui$ = this.getChannel('UI')
      .filter(filterLocalUIEvents)
      .subscribe((p) => this.changeEditState(true));
  }
}
