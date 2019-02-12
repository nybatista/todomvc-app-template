class TodosModel extends spyne.ChannelsBase {
	constructor(props = {}) {
		const R = window.R;
		super();
		this.props.name = 'MODEL';
		this.STORAGE_KEY = 'todos-spyne';
		this.localStorageObj = this.getStorageItems();
		this.observer$ = new rxjs.BehaviorSubject();
		this.getChannel('WINDOW').pipe(
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
