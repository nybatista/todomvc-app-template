class Todo extends spyne.ViewStream {
	constructor(props = {}) {
		props.tagName = 'li';
		props.template = document.querySelector('.todo-tmpl');
		props['class'] = ['todos'];
		props['dataset'] = props.data;
		super(props);

	}

	broadcastEvents() {
		return [
			['div', 'dblClick', 'local'],
			['input.edit', 'keyup', 'local'],
			['input.toggle', 'change', 'local'],
			['button.destroy', 'click', 'local'],

		];
	}

	addActionListeners() {
		return [
			['CHANNEL_UI_CHANGE_EVENT', 'onUpdateCompleted'],
			['CHANNEL_UI_DBLCLICK_EVENT', 'onUpdateEdits'],
			['CHANNEL_UI_CLICK_EVENT', 'onUIClick'],
			['CHANNEL_UI_KEYUP_EVENT', 'onEnterPressed'],
		];
	}

	onUpdateTitle(txt) {
		this.props.titleEl.textContent = txt;
		this.onUpdateEdits(false);

	}

	onDestroy(item) {
		this.disposeViewStreamChain();
	}

	onEnterPressed(item) {
		const keyPressed = R.path(['event', 'key'], item);
		if (keyPressed === 'Enter') {
			const titleText = R.path(['srcElement', 'el', 'value'], item);
			this.onUpdateTitle(titleText);
		}
	}

	onUpdateEdits(bool = true) {
		this.props.el$().toggleClass('editing', bool);
	}

	onDestroyAllCompleted(item) {
		if (this.props.checkBox.checked === true) {
			this.disposeViewStreamChain();
		}
	}

	onUpdateAll(item) {
		this.props.checkBox.checked = R.path(['srcElement', 'el', 'checked'], item);
		this.onUpdateCompleted(item);
	}

	onUpdateCompleted(item) {
		this.props.el$().toggleClass('completed', this.props.checkBox.checked);
	}

	onUIClick(item) {
		const methodsHash = {
			'destroy-item': this.onDestroy.bind(this),
			'completed-item': this.onUpdateCompleted.bind(this),
			'completed-all': this.onUpdateAll.bind(this),
			'destroy-all': this.onDestroyAllCompleted.bind(this),
			'title-dbclick-item': this.onUpdateTitle.bind(this),
		};
		const fn = methodsHash[item.props().type];
		fn(item);
	}

	updateCheckBox() {
		this.props.el$('input.toggle').el.checked = this.props.data.completed;
	}

	afterRender() {
		this.props.el$().toggleClass('completed', this.props.data.completed);
		this.props.checkBox = this.props.el$('input.toggle').el;
		this.props.titleEl = this.props.el$('div label').el;
		this.updateCheckBox();
		this.addChannel('CHANNEL_UI');

	}
}
