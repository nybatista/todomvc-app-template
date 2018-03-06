class Todo extends spyne.ViewStream {
  constructor(props = {}) {
    props.tagName = 'li';
    props.tmpl = document.querySelector('.todo-tmpl');
    props['class'] = ['todos'];

    R.when(
      R.propEq('key', 'title'),
      R.assoc('title', 'val')
    )(props.data);

    props['dataset'] = props.data;
    super(props);
    this.id = props.data.id;
    this.title = props.data.title;
  }

  broadcastEvents() {
    return [
      ['div', 'dblClick'],
      ['input.edit', 'keyup'],
      ['input.toggle', 'click'],
      ['button.destroy', 'click']

    ];
  }

  addActionMethods() {
    return [
    	['UPDATE_TODOS_EVENT', 'onTodosEvent'],
      ['DESTROY_TODOS_EVENT', 'onRemoveTodosEvent'],
		    ['UI_EVENT_CLICK', 'changeEditState'],
    ];
  }

  onRemoveTodosEvent(p) {
	  let isLocalUpdateFilter = R.contains(this.id, p.payload.id);
    if (isLocalUpdateFilter === true) {
      this.onDispose();
    }
  }

  onTodosEvent(p) {
    let isLocalUpdateFilter = R.contains(this.id, p.payload.id);
    if (isLocalUpdateFilter === true) {
      this.updateDom(p.payload.key, p.payload.val);
    }
  }

  updateDom(k, v) {
    const cList = this.props.el.classList;
    if (k === 'completed') {
      this.props.data.completed = v;
      const classUpdate = v === true ? R.invoker(1, 'add') : R.invoker(1, 'remove');
      classUpdate(k, cList);
      this.updateCheckBox();
    } else if (k === 'title') {
      const label = this.props.el.querySelector('div label');
      label.textContent = v;
      cList.remove('editing');
    }
  }
  changeEditState(p) {
	  let checkForLocalDblClick = p.data.cid === this.props.id && p.data.event === 'dblClick';
		this.props.el$.setClassOnBool('editing', checkForLocalDblClick);
  }
  updateCheckBox() {
  	console.log('props is ',this.props.el$.query);
    //this.props.el$.query('input.toggle').el.checked = this.props.data.completed;
  }
  afterRender() {
    if (this.props.data.completed === true) {
      this.props.el.classList.add('completed');
    }

    this.updateCheckBox();
    this.addChannel("UI");

  }
}
