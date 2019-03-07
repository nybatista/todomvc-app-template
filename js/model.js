class TodosModel extends spyne.ChannelsBase {
	constructor(name, props = {}) {
		const R = window.R;
		props.sendLastPayload = true;
		super(name, props);
		this.STORAGE_KEY = 'todos-spyne';
		this.localStorageObj = this.getStorageItems();
		this.getChannel('CHANNEL_WINDOW').pipe(
				rxjs.operators.filter(p => p.action === 'CHANNEL_WINDOW_BEFOREUNLOAD_EVENT'),
				rxjs.operators.map(this.createLocalStorageDataFromTodosEl)).
				subscribe(this.setStorage.bind(this));

	}

	createLocalStorageDataFromTodosEl() {
		const getDataFromEl = (acc, el) => {
			let title = String(el.innerText).replace(/\n/gm, '');
			let completed = el.querySelector('div input.toggle').checked;
			acc.push({title, completed});
			return acc;

		};
		let todoListEl = document.querySelectorAll('.todo-list li');
		return R.reduce(getDataFromEl, [], todoListEl);
	}

	initializeStream() {
		this.sendStreamItem(this.channelActions.CHANNEL_MODEL_INIT_TODOS_EVENT, this.localStorageObj);
	}

	addRegisteredActions() {
		return [
			'CHANNEL_MODEL_INIT_TODOS_EVENT',
		];
	}

	getStorageItems() {
		return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) ||
				this.setStorage();
	}

	setStorage(obj = []) {
		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj));
		return obj;
	}
}
