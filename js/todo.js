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
      ['DESTROY_TODOS_EVENT', 'onRemoveTodosEvent']
    ];
  }

  onRemoveTodosEvent(p) {
	  let isLocalUpdateFilter = R.contains(this.id, p.payload.id);
    if (isLocalUpdateFilter === true) {
      this.ui$.unsubscribe();
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
  changeEditState(bool = false) {
    this.props.el.classList.toggle('editing');
  }
  updateCheckBox() {
    this.props.el.querySelector('input.toggle').checked = this.props.data.completed;
  }
  afterRender() {
    if (this.props.data.completed === true) {
      this.props.el.classList.add('completed');
    }

    this.updateCheckBox();
    let filterLocalUIEvents = p => p.data.cid === this.props.id && p.data.event === 'dblClick';

    this.ui$ = this.getChannel('UI')
      .filter(filterLocalUIEvents)
      .subscribe((p) => this.changeEditState(true));
  }
}
