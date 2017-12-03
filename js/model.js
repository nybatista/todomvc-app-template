 class TodosModel extends spyne.ChannelsBase {
	constructor(){

		super();
		this.settings.name = 'MODEL';

		this.STORAGE_KEY = 'todos-yaya';
		this.localStorageObj = this.getStorageItems();

		window.lStorage = this.localStorageObj;
		this.observer$ = new Rx.BehaviorSubject(
			{
				action: 'INIT_TODOS_EVENT',
				payload: this.localStorageObj
			});

		this.ENTER_KEY = 13;

		const uiTypePath = ['data','type'];
		const uiValPath =  ['mouse','target','value'];
		let isEnterKey = R.pathEq(['mouse','keyCode'], this.ENTER_KEY);
		let inputIsNotEmpty =  R.pathSatisfies(R.complement(R.isEmpty), uiValPath);
		let isNotNew =  R.complement(R.pathEq('title-new', uiTypePath));
		let newInputNotEmpty = R.both([inputIsNotEmpty, isNotNew]);

		let filterInputValue = R.allPass([isEnterKey, newInputNotEmpty]);
		const checkForBtnEvents = R.complement(R.pathSatisfies(R.startsWith('title'), uiTypePath));

		const filterUIElements = R.either(checkForBtnEvents, filterInputValue);


		this.ui$ = this.getChannel("UI")
			//.do(p => console.log('p data is ',p.data.mouse.value === undefined, p.data.type==='title-new',p.data.mouse.value, p.data.type) )
			.filter(filterUIElements)
			.map(p=>{
				const obj = R.clone(this.localStorageObj);
				return todoParser(p, obj);
			})
			//.subscribe(p => console.log("subscribed: ",p));
		;


		// TODOS PARSING

		const getCompletedAllItemsBool = ()=>!R.all(R.equals(true), R.map(x=>x.classList.contains('completed'))(document.querySelectorAll('.todo-list li')));
		const getCompletedItemBool =  R.pathEq(['mouse','target','checked'], true);


		// PULL ITEMS TO MUTATE
		const allListArr = () => R.map(x=>x.dataset.id,  document.querySelectorAll('.todo-list li.todos'));
		const destroyItemsArr = () =>  R.map(x=>x.dataset.id,  document.querySelectorAll('.todo-list li.todos.completed'));

		const updateFn = (key, val, id, obj) => {
			const itemInList = R.propSatisfies(R.contains(R.__, id), 'id');
			const updateParams = R.when(itemInList, R.assoc(key, val));
			return  R.map(updateParams, obj);
		};

		const destroyFn = (key, val, id, obj)  =>  R.reject(R.propSatisfies(R.contains(R.__, id), 'id'), obj);
		const titleFn = (key, title, id, obj, completed = false) =>  R.append({id,title,completed}, obj);

		const todoParser = (p,o) => {
			console.log('todo parser ',p,o);
			console.log(isNotNew(p), p.data.type,' p data is ',R.isEmpty(p.mouse.target.value), p.data.type==='title-new',p.mouse.target.value, p.data.type)
			let key = R.head(R.split('-', p.data.type));
			const itemList = R.of(p.data.id);
			const isItem = R.isNil(R.head(itemList)) === false;
			const mouseInputValueFn = p => p.mouse.target.value;
			const todoInputIsEmpty = p.data.type === 'title-item' && R.isEmpty(p.mouse.target.value);

			if (todoInputIsEmpty === true){
				key = 'destroy';
			}

			console.log("TODO INPUT EMPTY ",todoInputIsEmpty);


			const getData = k => {
				 const data = {
					completed: {
						fn: updateFn,
						id: isItem === true ? itemList : allListArr(p),
						val: isItem === true ? getCompletedItemBool(p) : getCompletedAllItemsBool(),
						action: "UPDATE_TODOS_EVENT"
					},
					// title values

					title: {
						fn: isItem === true ? updateFn : titleFn,
						id: isItem === true ? itemList : this.getNextId(),
						val: mouseInputValueFn(p),
						action:  isItem === true ? "UPDATE_TODOS_EVENT" : "ADD_TODO_EVENT"

					},
					destroy: {
						// destroy values
						fn: destroyFn,
						id: isItem === true ? itemList : destroyItemsArr(),
						val: undefined,
						action: "DESTROY_TODOS_EVENT"

					}
				};

				 return Object.assign({key}, data[key]);

			};

			const output = (args, o) => {
				const {key, action, val, id, fn } = args;
				const obj = fn(key,val,id,o);
				const payload = {key,id,val,action};
				return {action, payload, obj};
			};

			return output(getData(key), o);
		};


			this.ui$
			.subscribe(p => this.onSendStream(p));

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

	onSendStream(data){
		const {action, payload, obj} = data;

		console.log("DATA ",action,payload,obj);

		this.observer$.next({action, payload});

		this.localStorageObj = this.setStorage(obj);
	};


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
