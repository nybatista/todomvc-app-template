class TodosModel extends spyne.ChannelsBase {
  constructor() {
    super();
    R = window.R;
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

    const uiTypePath = ['data', 'type'];
    const uiValPath =  ['mouse', 'target', 'value'];
    const uiCheckboxPath = ['mouse', 'target', 'checked'];

    let isEnterKey = R.pathEq(['mouse', 'keyCode'], this.ENTER_KEY);
    let inputIsNotEmpty =  R.pathSatisfies(R.complement(R.isEmpty), uiValPath);
    let isNewInput =  R.pathEq(uiTypePath, 'title-new');

    const filterInputValue = R.allPass([isEnterKey, inputIsNotEmpty, isNewInput]);
    const filterTodoInput = R.allPass([isEnterKey, R.complement(isNewInput)]);
    const filterUiBtns = R.complement(R.pathSatisfies(R.startsWith('title'), uiTypePath));

    const filterAllTodoEvents = R.anyPass([filterUiBtns, filterInputValue, filterTodoInput]);

    this.ui$ = this.getChannel('UI')
      .filter(filterAllTodoEvents)
      .map(p => {
        const obj = R.clone(this.localStorageObj);
        return todoParser(p, obj);
      });

    // TODOS PARSING
    const getLiEls = (c = '') => document.querySelectorAll(`.todo-list li${c}`);
    const getSelectedLiItems = () => R.map(el => el.classList.contains('completed')(getLiEls()));
    const getAllCompletedItemsBool = () => !R.all(R.equals(true), R.map(x => x.classList.contains('completed'))(getLiEls()));
    const getCompletedItemBool =  R.pathEq(uiCheckboxPath, true);

    // PULL ITEMS TO MUTATE
    const allListArr = () => R.map(el => el.dataset.id, getLiEls('.todos'));
    const destroyItemsArr = () => R.map(el => el.dataset.id, getLiEls('.todos.completed'));

    // MAIN UPDATE METHODS

    const updateTodoParams = (key, val, id, obj) => {
      const itemInList = R.propSatisfies(R.contains(R.__, id), 'id');
      const updateParams = R.when(itemInList, R.assoc(key, val));
      return R.map(updateParams, obj);
    };

    const destroyTodos = (key, val, id, obj) => R.reject(R.propSatisfies(R.contains(R.__, id), 'id'), obj);
    const createTodo = (key, title, id, obj, completed = false) => R.append({id, title, completed}, obj);

    const todoParser = (p, o) => {
      console.log('todo parser ', p, o);
      // console.log(newInputNotEmpty(p),  R.path(uiTypePath, p), p.data.type==='title-new', R.pathEq(uiTypePath, 'title-new')(p),isNotNew(p), p.data.type,' p data is ',R.isEmpty(p.mouse.target.value), p.data.type==='title-new',p.mouse.target.value, p.data.type)
      let key = R.head(R.split('-', p.data.type));
      const itemList = R.of(p.data.id);
      const isItem = R.isNil(R.head(itemList)) === false;
      const inputValue = R.path(uiValPath, p);
      // const mouseInputValueFn = p => p.mouse.target.value;
      const todoInputIsEmpty = p.data.type === 'title-item' && R.isEmpty(inputValue);

      key = todoInputIsEmpty === true ? 'destroy' : key;

      const getData = k => {
				 const data = {
          completed: {
            fn: updateTodoParams,
            id: isItem === true ? itemList : allListArr(p),
            val: isItem === true ? getCompletedItemBool(p) : getAllCompletedItemsBool(),
            action: 'UPDATE_TODOS_EVENT'
          },
          // title values

          title: {
            fn: isItem === true ? updateTodoParams : createTodo,
            id: isItem === true ? itemList : this.getNextId(),
            val: inputValue,
            action:  isItem === true ? 'UPDATE_TODOS_EVENT' : 'ADD_TODO_EVENT'

          },
          destroy: {
            // destroy values
            fn: destroyTodos,
            id: isItem === true ? itemList : destroyItemsArr(),
            val: undefined,
            action: 'DESTROY_TODOS_EVENT'

          }
        };

				 return Object.assign({key}, data[key]);
      };

      const output = (args, o) => {
        const {key, action, val, id, fn } = args;
        const obj = fn(key, val, id, o);
        const payload = {key, id, val, action};
        return {action, payload, obj};
      };

      return output(getData(key), o);
    };

    this.ui$
      .subscribe(p => this.onSendStream(p));
  }

  getNextId() {
    const padMaxNum = 6;
    const num = this.getHighestIdNum() + 1;
    const padNum = padMaxNum - String(num).length;
    return String('0').repeat(padNum) + num;
  }

	 getHighestIdNum() {
		 const getNum =  R.compose(R.defaultTo(0), parseInt, R.last, R.pluck('id'));
		 return getNum(this.localStorageObj);
	 }

  onSendStream(data) {
    const {action, payload, obj} = data;

    console.log('DATA ', action, payload, obj);

    this.observer$.next({action, payload});

    this.localStorageObj = this.setStorage(obj);
  }

  getStorageItems() {
		 return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || this.setStorage();
  }

  setStorage(obj = []) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj));
    return obj;
  }
  onObserversCallback(p) {
    console.log('the val is ', p);
  }
}
