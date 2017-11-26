 class TodosModel extends spyne.ChannelsBase {
	constructor(){


		super();
		this.settings.name = 'MODEL';

		this.STORAGE_KEY = 'todos-yaya3';

		this.actions = {
			INIT_TODOS_EVENT   :  'INIT_TODOS_EVENT',
			ADD_TODO_EVENT     :  'ADD_TODO_EVENT',
			REMOVE_TODO_EVENT  :  'REMOVE_TODO_EVENT',
			UPDATE_TODOS_EVENT :  'UPDATE_TODOS_EVENT'
		};

		this.localStorageObj = this.getStorageItems();
		window.localObj = this.localStorageObj;
		this.idIter = this.getHighestIdNum();
		console.log('id iter  = ',this.idIter);

		this.observer$ = new Rx.BehaviorSubject(
			{
				action: 'INIT_TODOS_EVENT',
				payload: this.localStorageObj
			});


		this.ENTER_KEY = 13;

		let isEnterKey = R.pathEq(['mouse','keyCode'], this.ENTER_KEY);
		let valIsNotNull =  R.pathSatisfies(str => str.length >= 1, ['mouse','target','value']);
		let filterInput = R.allPass([isEnterKey, valIsNotNull]);

		//this.uiChannel$ = this.getChannel("UI");

		const [inputSrc$, uiSrc$] = this.getChannel("UI").partition(evt => evt.data.type === "todos-input");

		let input$ = inputSrc$
			.do((evt)=>console.log('p and m ',evt, R.path(['mouse','target','value'], evt)))
			//.map(evt=>evt.mouse)
			.filter(filterInput);

		let ui$ = uiSrc$
			.map(evt=>{
				console.log('evt val is ',evt.data, evt.mouse.target);
				return evt;
			});



		let subscriber$ = Rx.Observable.merge(input$,ui$)
			.subscribe(evt => {
				let cList = { classList : evt.mouse.target.classList[0]};
			 let obj =Object.assign({},evt.data, cList, R.pickAll(['value', 'checked'],evt.mouse.target))

				console.log(' --- ',evt," MERGED ",obj);
			// window.theObj = obj;

			});






			//.subscribe((p)=>this.onInputEntered(p));

	}

	onInputEntered(evt){
		this.addTodoObject( R.trim(evt.target.value));
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


		//this.setStorage(this.localStorageObj.push(obj));
		this.localStorageObj.push(obj);
		console.log("STORAGE ",typeof(this.localStorageObj), JSON.stringify(obj), obj);
		this.setStorage(this.localStorageObj);
		this.onSendStream('ADD_TODO_EVENT', obj);
	}

	onSendStream(a, o){
		let action = this.actions[a];
		let payload = o;
		this.observer$.next({action, payload});
	}

	getStorageItems(){
		 return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || this.setStorage();
	}
	getHighestIdNum(){
		const getNum =  R.compose(R.defaultTo(0), parseInt, R.last, R.pluck('id'));
		return getNum(this.localStorageObj);
	}

	setStorage(obj=[]) {
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj));
			return obj;
	}
	onObserversCallback(p){

		console.log('the val is ',p);
	}





}
