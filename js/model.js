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




		const completedAllFn = (p,obj) => {
			return updateParamsInObj('completed', getCompletedAllItemsBool(), completedAllArr, obj);
		};
		const completedItemFn = (p,obj) => {
			const val = getCompletedItemBool(p);
			const arr = itemArr(p);
			return updateParamsInObj('completed', val, arr, obj);
		};
		const destroyItemsFn = obj => {
			const arr = destroyItemsArr(obj);
			const itemInArr = R.propSatisfies(R.contains(R.__, arr), 'id');
			return R.reject(itemInArr, obj);
		};
		const titleItemFn = (p,obj) => {
			const key = 'title';
			const value = R.path(['mouse','target','value']);
			//console.log("k v ",key,value, R.of(p.data.id));
			return updateParamsInObj(key,value(p), p.data.id, obj);
		};

		const titleNewFn = (p, o) => {
			//	console.log('p is ',p);
			const title = p.mouse.target.value;
			let newItemObj = {
				id: this.getNextId(),
				title,
				completed: false
			};

			console.log('new Item ',newItemObj);

			return R.append(newItemObj, o);

		};

		const fList = {completedAllFn, completedItemFn, destroyItemsFn, titleItemFn, titleNewFn};
		console.log('function list ',fList, fList['completedAllFn']);


		this.ui$ = this.getChannel("UI")
			.filter(filterUIElements)
			.map(p=>{
				const obj = this.localStorageObj;

				let fnName = camelCase(p.data.type)+"Fn";

				//let newObj = updateParamsInObj('completed', 'yaya is here a title ',destroyItemsArr, obj);
				//let completedAll = completedAllFn(getCompletedAllItemsBool(), obj);
				//let completedItem = completedItemFn(getCompletedItemBool(p),itemArr(p),obj);
				//let destroyCompletedItems = destroyItemsFn(obj);
				//let destroyItems = destroyItemsFn(obj);
				//	console.log({completedAll, completedItem, destroyCompletedItems},' p is ',p);
				//console.log('update title ',updateTitle(p,obj))
				let newObj  = titleNewFn(p,obj);
				console.log('p is ',p,newObj,fList[fnName](p,obj));

				return p;

			})
			.subscribe(evt=>evt);



/*

		let input$ = inputSrc$
			.do((evt)=>console.log('p and m ',evt, R.path(['mouse','target','value'], evt)))
			//.map(evt=>evt.mouse)
			.filter(filterInput);





		let subscriber$ = Rx.Observable.merge(input$)
			.subscribe(evt => {
				console.log(' --- ',evt," MERGED ",evt);
			// window.theObj = obj;

			});
*/






			//.subscribe((p)=>this.onInputEntered(p));

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
