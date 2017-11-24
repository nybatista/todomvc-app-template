 class TodosModel extends spyne.ChannelsBase {
	constructor(){


		super();

		this.STORAGE_KEY = 'todos-yaya';

		this.localStorageObj = this.getStorageItems();
		this.idIter = this.getHighestIdNum();
		console.log('id iter  = ',this.idIter);

		this.observer$ = new Rx.BehaviorSubject(this.localStorageObj);

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
		let val = evt.target.value;
		if (val.length>=1){
			this.addTodoObject(val);
		}
		console.log("input enterered ",val);
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
		console.log("TODO OBJ IS ",obj);
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
