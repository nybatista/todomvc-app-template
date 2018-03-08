class Todo extends spyne.ViewStream {
  constructor(props = {}) {
    props.tagName = 'li';
    props.template = document.querySelector('.todo-tmpl');
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
      ['div',            'dblClick',  'local'],
      ['input.edit',     'keyup',     'local'],
      ['input.toggle',   'change',    'local'],
      ['button.destroy', 'click',     'local']

    ];
  }

  addActionMethods() {
    return [
    	['UPDATE_TODOS_EVENT', 'onTodosEvent'],
      ['DESTROY_TODOS_EVENT', 'onRemoveTodosEvent'],
	    ['CHANNEL_UI_.*', 'onUIClick']
/*
	    ['UI_EVENT_CLICK', 'changeEditState'],
*/
    ];
  }

  onUpdateTitle(item){
  	console.log('on update title');

  }
  onDestroy(item){
  	this.sendChannelPayload('MODEL', {ubu:5});
  	console.log('on destroy');
  	//this.onDispose();
  }

  onUpdateCompleted(item){
  	console.log('completed updated');
  }

  onUIClick(item){

  	const methodsHash = {
		  "destroy-item" : this.onDestroy.bind(this),
		  "completed-item" : this.onUpdateCompleted.bind(this),
		  "title-dbclick-item" : this.onUpdateTitle.bind(this)
	  };

  	//	const fn = methodsHash[item.channelPayload.type];
  	//	fn(item);




  	//const itemId = item.srcElement.cid;
	  console.log('isLocalEvent item ',item.channelPayload);

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
		this.props.el$.toggleClass('editing', checkForLocalDblClick);
  }
  updateCheckBox() {
    this.props.el$.query('input.toggle').el.checked = this.props.data.completed;
  }
  afterRender() {
	  this.props.el$.toggleClass('completed', this.props.data.completed);
    this.updateCheckBox();
    this.addChannel("UI");

  }
}
