 class TodosModel extends spyne.ChannelsBase {
	constructor(){


		super();
		this.settings.name = 'MODEL';

		this.STORAGE_KEY = 'todos-yaya';

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

		this.completedItemsBool = false;

		this.ENTER_KEY = 13;

		const camelCase = (str) => str.replace(/[-_]([a-z])/g, (m) => m[1].toUpperCase());

		let isEnterKey = R.pathEq(['mouse','keyCode'], this.ENTER_KEY);
		let inputIsNotEmpty =  R.pathSatisfies(R.complement(R.isEmpty), ['mouse','target','value']);
		let filterInputValue = R.allPass([isEnterKey, inputIsNotEmpty]);
		const checkForBtnEvents = R.complement(R.pathSatisfies(R.startsWith('title'), ['data','type']));

		const filterUIElements = R.either(checkForBtnEvents, filterInputValue);
		//const [inputSrc$, uiSrc$] = this.getChannel("UI").partition(checkForInput);

		const getCompletedAllItemsBool = () => this.completedItemsBool = !this.completedItemsBool;
		const getCompletedItemBool =  R.pathEq(['mouse','target','checked'], true);


		// PULL ITEMS TO MUTATE
		const completedAllArr = R.pluck('id');
		const destroyItemsArr = R.compose(R.pluck('id'), R.filter(R.propEq('completed', true)));
		const itemArr = R.path(['data','id']);


		// BASE METHODS


		const updateParamsInObj = R.curry((k,v, arrFn, obj) => {
			let arr =  typeof(arrFn)==='string' ? arrFn : arrFn(obj);
			//let arr = arrFn;
			//console.log('typeof ',typeof(arrFn), arrFn)
			const itemInArr = R.propSatisfies(R.contains(R.__, arr), 'id');
			let propKey = k;
			let propVal = v;
			const updateParams = R.when(
				itemInArr,
				R.assoc(propKey, propVal),
			);
			return R.map(updateParams,obj);

		});
		let mouseInputValueFn = p => p.mouse.target.value;


		const createFillObj =  (key, value, arr, obj) => ({ key, value, arr, obj });

		const completedAllParams = (p,o) => createFillObj('completed', getCompletedAllItemsBool(), completedAllArr(o), o);
		const completedItemParams = (p,o) => createFillObj('completed', getCompletedItemBool(p), R.of(itemArr(p)), o);
		const destroyItemParams = (p,o) => createFillObj('destroy', undefined,  R.of(itemArr(p)), o);
		const destroyAllParams = (p,o) => createFillObj('destroy',undefined, destroyItemsArr(o), o);
		const titleItemParams = (p,o) => createFillObj('title', mouseInputValueFn(p), itemArr(p), o);
		const titleNewParams = (p,o) => createFillObj('title', mouseInputValueFn(p), this.getNextId(), o);



		const completedAllFn = (p,obj) => {
			return updateParamsInObj('completed', getCompletedAllItemsBool(), completedAllArr, obj);
		};
		const completedItemFn = (p,obj) => {
			return updateParamsInObj('completed', getCompletedItemBool(p), itemArr(p), obj);
		};
		const destroyItemFn = (p, obj) => {
			const item = R.propEq('id', p.data.id);
			return R.reject(item, obj);
		};

		const destroyAllFn = (p, obj) => {
			const arr = destroyItemsArr(obj);
			const itemInArr = R.propSatisfies(R.contains(R.__, arr), 'id');
			return R.reject(itemInArr, obj);
		};
		const titleItemFn = (p,obj) => {
			const value = R.path(['mouse','target','value']);
			return updateParamsInObj('title',value(p), p.data.id, obj);
		};

		const titleNewFn = (p, o) => {
			const title = p.mouse.target.value;
			let newItemObj = {
				id: this.getNextId(),
				title,
				completed: false
			};
			return R.append(newItemObj, o);
		};

		const fList = {completedAllFn, completedItemFn, destroyItemFn, destroyAllFn, titleItemFn, titleNewFn};

		const fParamsList = {completedAllParams, completedItemParams, destroyItemParams, destroyAllParams, titleItemParams, titleNewParams};
		console.log('function list ',fList, fList['completedAllFn']);


		this.ui$ = this.getChannel("UI")
			.filter(filterUIElements)
			.map(p=>{
				const obj = this.localStorageObj;

				let fnName = camelCase(p.data.type)+"Fn";
				let paramsName = camelCase(p.data.type)+"Params";
				let paramsFn = fParamsList[paramsName];

				//let newObj = updateParamsInObj('completed', 'yaya is here a title ',destroyItemsArr, obj);
				//let completedAll = completedAllFn(getCompletedAllItemsBool(), obj);
				//let completedItem = completedItemFn(getCompletedItemBool(p),itemArr(p),obj);
				//let destroyCompletedItems = destroyItemsFn(obj);
				//let destroyItems = destroyItemsFn(obj);
				//	console.log({completedAll, completedItem, destroyCompletedItems},' p is ',p);
				//console.log('update title ',updateTitle(p,obj))
				//let newObj  = titleNewFn(p,obj);
				console.log("fn is ",fnName);
				console.log('p is ',paramsFn(p,obj), '---- ',p);
				let o = fList[fnName](p,obj);
				let a = 'UPDATE_TODOS_EVENT';

				return {a,o};

			})
			.subscribe(p => console.log(p));




	}

	onInputEntered(evt){
		this.addTodoObject( R.trim(evt.target.value));
	}

	getNextId(){
		const padMaxNum = 6;
		this.idIter++;
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
