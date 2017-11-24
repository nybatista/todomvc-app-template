 class TodosModel extends spyne.ChannelsBase {
	constructor(){


		super();

		this.STORAGE_KEY = 'todos-yaya';

		this.actions = {
			INIT_TODOS_EVENT   :  'INIT_TODOS_EVENT',
			ADD_TODO_EVENT     :  'ADD_TODO_EVENT',
			REMOVE_TODO_EVENT  :  'REMOVE_TODO_EVENT',
			UPDATE_TODOS_EVENT :  'UPDATE_TODOS_EVENT'
		};

		this.localStorageObj = this.getStorageItems();
		this.idIter = this.getHighestIdNum();
		console.log('id iter  = ',this.idIter);

		this.observer$ = new Rx.BehaviorSubject(
			{
				action: 'INIT_TODOS_EVENT',
				payload: this.localStorageObj
			});

		this.settings.name = 'MODEL';

		this.ENTER_KEY = 13;

		let isEnterKey = R.propEq('keyCode', this.ENTER_KEY);
		let valIsNotNull =  R.pathSatisfies(str => str.length >= 1, ['target','value']);
		let filterKeys = R.allPass([isEnterKey, valIsNotNull]);

		this.uiChannel$ = this.getChannel("UI")
			.map(evt=>evt.mouse)
			.filter(filterKeys)
			.subscribe((p)=>this.onInputEntered(p));

	}

	onInputEntered(evt){
		this.addTodoObject( evt.target.value);
	}

	getNextId(){
		const padMaxNum = 6;
		this.idIter++;
		const padNum = padMaxNum - this.idIter.length;
		return String('0').repeat(padNum)+this.idIter;

	}



	addTodoObject(val){
		let obj = {
			id: this.getNextId(),
			title: val,
			completed: false
		};

		this.onSendStream('ADD_TODO_EVENT', obj);
	}

	onSendStream(a, o){
		let action = this.actions[a];
		let payload = o;
		this.observer$.next({action, payload});
	}

	getStorageItems(){
		 return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
	}
	getHighestIdNum(){
		const getNum =  R.compose(R.defaultTo(0), parseInt, R.last, R.pluck('id'));
		return getNum(this.localStorageObj);
	}




	onObserversCallback(p){

		console.log('the val is ',p);
	}





}
