 class TodosModel extends spyne.ChannelsBase {
	constructor(){

		super();
		this.settings.name = 'MODEL';

		this.STORAGE_KEY = 'todos-yaya';
		this.localStorageObj = this.getStorageItems();
		this.observer$ = new Rx.BehaviorSubject(
			{
				action: 'INIT_TODOS_EVENT',
				payload: this.localStorageObj
			});

		this.ENTER_KEY = 13;


		let isEnterKey = R.pathEq(['mouse','keyCode'], this.ENTER_KEY);
		let inputIsNotEmpty =  R.pathSatisfies(R.complement(R.isEmpty), ['mouse','target','value']);
		let filterInputValue = R.allPass([isEnterKey, inputIsNotEmpty]);
		const checkForBtnEvents = R.complement(R.pathSatisfies(R.startsWith('title'), ['data','type']));

		const filterUIElements = R.either(checkForBtnEvents, filterInputValue);


		this.ui$ = this.getChannel("UI")
			.filter(filterUIElements)
			.map(p=>{
				const obj = R.clone(this.localStorageObj);
				return todoImpureData(p, obj);
			});


		// TODOS PARSING

		const getCompletedAllItemsBool = ()=>!R.all(R.equals(true), R.map(x=>x.classList.contains('completed'))(document.querySelectorAll('.todo-list li')));
		const getCompletedItemBool =  R.pathEq(['mouse','target','checked'], true);


		// PULL ITEMS TO MUTATE
		const allListArr = () => R.map(x=>x.dataset.id,  document.querySelectorAll('.todo-list li.todos'));
		const destroyItemsArr = () =>  R.map(x=>x.dataset.id,  document.querySelectorAll('.todo-list li.todos.completed'));

		const updateFn = (key, val, list, obj) => {
			const itemInList = R.propSatisfies(R.contains(R.__, list), 'id');
			const updateParams = R.when(itemInList, R.assoc(key, val));
			return  R.map(updateParams, obj);
		};

		const destroyFn = (key, val, list, obj)  =>  R.reject(R.propSatisfies(R.contains(R.__, list), 'id'), obj);
		const titleFn = (key, title, id, obj, completed = false) =>  R.append({id,title,completed}, obj);

		const todoImpureData = (p,o) => {
			const key = R.head(R.split('-', p.data.type));
			const itemList = R.of(p.data.id);
			const isItem = R.isNil(R.head(itemList)) === false;
			const mouseInputValueFn = p => p.mouse.target.value;


			const getData = k => {
				 const data = {
					completed: {
						fn: updateFn,
						list: isItem === true ? itemList : allListArr(p),
						val: isItem === true ? getCompletedItemBool(p) : getCompletedAllItemsBool(),
						action: "UPDATE_TODOS_EVENT"
					},
					// title values

					title: {
						fn: isItem === true ? updateFn : titleFn,
						list: isItem === true ? itemList : this.getNextId(),
						val: mouseInputValueFn(p),
						action:  isItem === true ? "UPDATE_TODOS_EVENT" : "ADD_TODO_EVENT"

					},
					destroy: {
						// destroy values
						fn: destroyFn,
						list: isItem === true ? itemList : destroyItemsArr(),
						val: undefined,
						action: "DESTROY_TODOS_EVENT"

					}
				};

				 return Object.assign({key}, data[key]);

			};

			const output = (args, o) => {
				const {key, action, val, list, fn } = args;
				const obj = fn(key,val,list,o);
				const payload = {key,list,val,action};
				return {action, payload, obj};
			};

			return output(getData(key), o);
		};


			this.ui$
			.subscribe(p => console.log(p));

	}


	getNextId(){
		const padMaxNum = 6;
		const num = this.getHighestIdNum()+1;
		const padNum = padMaxNum - String(num).length;
		return String('0').repeat(padNum)+num;
	}

	 getHighestIdNum(){
		 const getNum =  R.compose(R.defaultTo(0), parseInt, R.last, R.pluck('id'));
		 return getNum(this.localStorageObj);
	 }

	onSendStream(a, o){
		let action = this.actions[a];
		let payload = o;
		this.observer$.next({action, payload});
	}

	getStorageItems(){
		 return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || this.setStorage();
	}

	setStorage(obj=[]) {
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj));
			return obj;
	}
	onObserversCallback(p){

		console.log('the val is ',p);
	}





}
