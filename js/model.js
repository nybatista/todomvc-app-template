 class TodosModel extends spyne.ChannelsBase {
	constructor(){
		NodeList.prototype.map = HTMLCollection.prototype.map = Array.prototype.map;

		super();
		this.settings.name = 'MODEL';

		this.STORAGE_KEY = 'todos-yaya';

		this.actions = {
			INIT_TODOS_EVENT   :  'INIT_TODOS_EVENT',
			ADD_TODO_EVENT     :  'ADD_TODO_EVENT',
			REMOVE_TODO_EVENT  :  'REMOVE_TODO_EVENT',
			UPDATE_TODOS_EVENT :  'UPDATE_TODOS_EVENT'
		};

		const paramActions = this.paramActions = {
			completed: 'UPDATE_TODOS_EVENT',
			destroy: 'REMOVE_TODO_EVENT',
			title: 'UPDATE_TODOS_EVENT',
			titleNew: 'ADD_TODO_EVENT'


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

		this.completedItemsBool = false;

		this.ENTER_KEY = 13;

		const camelCase = (str) => str.replace(/[-_]([a-z])/g, (m) => m[1].toUpperCase());

		let isEnterKey = R.pathEq(['mouse','keyCode'], this.ENTER_KEY);
		let inputIsNotEmpty =  R.pathSatisfies(R.complement(R.isEmpty), ['mouse','target','value']);
		let filterInputValue = R.allPass([isEnterKey, inputIsNotEmpty]);
		const checkForBtnEvents = R.complement(R.pathSatisfies(R.startsWith('title'), ['data','type']));

		const filterUIElements = R.either(checkForBtnEvents, filterInputValue);

		//const getCompletedAllItemsBool = () => this.completedItemsBool = !this.completedItemsBool;
		const getCompletedAllItemsBool = () => document.querySelectorAll('.todo-list li.todos').length !== document.querySelectorAll('.todo-list li.completed').length;
		const getCompletedItemBool =  R.pathEq(['mouse','target','checked'], true);


		// PULL ITEMS TO MUTATE
		const completedAllArr = R.pluck('id');
		const allListArr = () => document.querySelectorAll('.todo-list li.todos').map(li => li.dataset.id);
		const destroyItemsArr = () => document.querySelectorAll('.todo-list li.todos.completed').map(li => li.dataset.id); // R.compose(R.pluck('id'), R.filter(R.propEq('completed', true)));
		const itemArr = R.path(['data','id']);


		// BASE METHODS


		const updateParamsInObj = (params) => {
			console.log("params in upate ",params);
			const itemInArr = R.propSatisfies(R.contains(R.__, params.arr), 'id');
			let propKey = params.key;
			let propVal = params.value;
			const updateParams = R.when(
				itemInArr,
				R.assoc(propKey, propVal),
			);
			params.obj = R.map(updateParams,params.obj);
			params['action'] = this.paramActions[params.key];
			return params;

		};



		const destroyItemFn = (params)  =>  {

			params.obj = R.reject(R.propSatisfies(R.contains(R.__, params.arr), 'id'), params.obj)
			params['action'] = this.paramActions[params.key];
			return params;

		};

		const titleNewFn = (params) => {
			const title = params.value;
			let newItemObj = {
				id: params.arr,
				title,
				completed: false
			};

			params.obj = R.append(newItemObj, params.obj);
			params['action'] = this.paramActions[params.key];
			return params;
		};





		let mouseInputValueFn = p => p.mouse.target.value;


		const todoParams =  (key, value, arr, obj) => ({ key, value, arr, obj });

		const completedAllParams = (p,o) => updateParamsInObj(todoParams('completed', getCompletedAllItemsBool(), completedAllArr(o), o));
		const completedItemParams = (p,o) => updateParamsInObj(todoParams('completed', getCompletedItemBool(p), R.of(itemArr(p)), o));
		const destroyItemParams = (p,o) => destroyItemFn(todoParams('destroy', undefined,  R.of(itemArr(p)), o));
		const destroyAllParams = (p,o) => destroyItemFn(todoParams('destroy',undefined, destroyItemsArr(o), o));
		const titleItemParams = (p,o) => updateParamsInObj(todoParams('title', mouseInputValueFn(p), R.of(itemArr(p)), o));
		const titleNewParams = (p,o) => titleNewFn(todoParams('titleNew', mouseInputValueFn(p), this.getNextId(), o));





		const fParamsList = {completedAllParams, completedItemParams, destroyItemParams, destroyAllParams, titleItemParams, titleNewParams};


		const todoImpureData = (p,o) => {
			const obj = o;
			const str = p.data.type;
			const key = R.head(R.split('-', str));
			const itemList = R.of(itemArr(p));
			const isItem = R.isNil(R.head(itemList)) === false;


			return {

				key,
				action:  paramActions[key],
				valBoolItem: getCompletedItemBool(p),
				valBoolAll: getCompletedAllItemsBool(),
				valFromInput: mouseInputValueFn(p),
				itemList,
				isItem,
				newId: this.getNextId(),
				allList: allListArr(p),
				destroyList: isItem === true ? itemList  : destroyItemsArr(),
				titleFn: isItem === true ? updateParamsInObj : titleNewFn,
				destroyFn: destroyItemFn,
				obj: o,

			}



		};



		const todoGenerator = () => {

			let key, value, arr, o, fn;

			let action = k => k+'_action';

			let event = {action, arr, key, value};
			let obj = fn(event);
			return {event, obj};

		};



		this.ui$ = this.getChannel("UI")
			.filter(filterUIElements)
			.map(p=>{

				const obj = this.localStorageObj;

				let paramsName = camelCase(p.data.type)+"Params";
				let paramsFn = fParamsList[paramsName];
				let newObject = paramsFn(p,obj);

				let eventParams = ['key','value','arr','action'];

				const parsedObj = {
					event: R.pick(eventParams)(newObject),
					obj: R.omit(eventParams)(newObject)

				};


				window.objF = newObject;

				console.log('parsed obj ',parsedObj,' ----> ',todoImpureData(p,obj));


				return p;

			})
			.subscribe(p => console.log(p));




	}

	onInputEntered(evt){
		this.addTodoObject( R.trim(evt.target.value));
	}

	getNextId(){
		const padMaxNum = 6;
		this.idIter = this.getHighestIdNum()+1;
		const padNum = padMaxNum - String(this.idIter).length;
		console.log('id is ',padNum,padMaxNum,String(this.idIter).length);
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
