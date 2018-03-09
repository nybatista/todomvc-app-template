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
	    ['CHANNEL_UI_CHANGE_EVENT', 'onUpdateCompleted'],
		  ['CHANNEL_UI_DBLCLICK_EVENT', 'onUpdateEdits'],
	    ['CHANNEL_UI_CLICK_EVENT', 'onUIClick'],
	    ['CHANNEL_UI_KEYUP_EVENT', 'onEnterPressed']
    ];
  }



  onUpdateTitle(txt){
  	console.log('on update title ',txt,this.props.titleEl);
  	this.props.titleEl.textContent = txt;
  	this.onUpdateEdits(false);

  }
  onDestroy(item){
  	this.onDispose();
  }

  onEnterPressed(item){
  	const keyPressed = R.path(['event','key'], item);
  	if (keyPressed==='Enter'){
  		const titleText = R.path(['srcElement', 'el', 'value'], item);
  		this.onUpdateTitle(titleText);
	  }
  }

  onUpdateEdits(bool=true){
  	console.log('update edits',)
	  this.props.el$.toggleClass('editing', bool);

  }

  onUpdateCompleted(item){
  	console.log('completed updated');
	  this.props.el$.toggleClass('completed', this.props.checkBox.checked);
  }

  onUIClick(item){

  	const methodsHash = {
		  "destroy-item" : this.onDestroy.bind(this),
		  "completed-item" : this.onUpdateCompleted.bind(this),
		  "title-dbclick-item" : this.onUpdateTitle.bind(this)
	  };

  		const fn = methodsHash[item.channelPayload.type];

  		if (fn!==undefined){
  			fn(item)
		  }
		  console.log('isLocalEvent item ',item);

  }

 /* onRemoveTodosEvent(p) {
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
  }*/
  updateCheckBox() {
    this.props.el$.query('input.toggle').el.checked = this.props.data.completed;
  }
  afterRender() {
	  this.props.el$.toggleClass('completed', this.props.data.completed);
	  this.props.checkBox = this.props.el$.query('input.toggle').el;
	  this.props.titleEl = this.props.el$.query('div label').el;
    this.updateCheckBox();
    this.addChannel("UI");

  }
}
