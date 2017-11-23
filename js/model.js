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

		let filterKey = e => e.keyCode===this.ENTER_KEY;
		this.uiChannel$ = this.getChannel("UI")
			.map(evt=>evt.mouse)
			.filter(filterKey)
		//.do((p)=>console.log("counter ui data is ",p))
			//.filter((p)=>p.data.type==="COUNTER_UPDATE")
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
		return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
	}
	getHighestIdNum(){
		const diff = (a,b) => b - a;
		const sorter = R.sort(diff);
		const getNum = s => parseInt(s);
		const getHighNum = R.compose(getNum,R.head,R.sort(diff), R.pluck('id'));
		return getHighNum(this.localStorageObj);
	}




	onObserversCallback(p){

		console.log('the val is ',p);
	}





}
