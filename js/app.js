(function(window) {
	'use strict';
	const spyneAppConfig = {
		channels: {
			WINDOW: {
				events: ['beforeunload'],
			},

			ROUTE: {
				isHash: true,
				routes: {
					routePath: {
						routeName: 'hashVal',
					},
				},
			},
		},
	};

	const spyneApp = new spyne.SpyneApp(spyneAppConfig);

	class App extends spyne.ViewStream {
		constructor(props = {}) {
			props['el'] = document.querySelector('.todoapp');
			super(props);
		}


		broadcastEvents() {
			return [
				['.new-todo', 'keyup', 'local'],
				['#toggle-all', 'click'],
				['button.clear-completed', 'click'],
			];
		}

		addActionListeners() {
			let actionFilter = this.createActionFilter(undefined, {
						type: R.contains(R.__, ['title-new']),
						event: R.propEq('key', 'Enter')
					}
			);

			return [
				['CHANNEL_MODEL_INIT_TODOS_EVENT', 'onInitTodos'],
				['CHANNEL_ROUTE_.*', 'onRouteChanged'],
				['CHANNEL_UI_KEYUP_EVENT', 'onAddNewTodo', actionFilter],
				['CHANNEL_UI_CLICK', 'updateTextCount'],
			];
		}

		onAddNewTodo(item) {
			const title = R.path(['srcElement', 'el', 'value'], item);
			if (title.length>0) {
				const completed = false;
			  this.addTodo({title, completed});
			}
			this.updateTextCount();
		}

		onInitTodos(p) {
			const payload = p.channelPayload;
			const addTodo = data => this.appendView(new Todo({data}), '.todo-list');
			payload.forEach(addTodo);
			this.updateTextCount();
		}

		addTodo(data) {
			this.appendView(new Todo({data}), '.todo-list');
			this.clearInput();
		}

		onRouteChanged(p) {
			const selectedClass = R.defaultTo('',
					R.path(['channelPayload', 'routeValue']))(p);
			this.props.el$('ul.todo-list').
					setClass(`todo-list ${selectedClass}`);
			this.updateMenu(selectedClass);
		}

		updateMenu(r) {
			const route = r === '' ? 'home' : r;
			const selectedItem = `[data-route=${route}]`;
			this.props.el$('footer ul li a').
					setActiveItem(selectedItem, 'selected');
		}
		onChildDisposed(o, p) {
			this.updateTextCount();
		}

		updateTextCount() {
			const num = document.querySelectorAll('.todo-list li').length;
			const itemsStr = num === 1 ? ' item left' : ' items left';
			this.props.el$().toggleClass('hide-elements', num === 0);
			this.counterText.el.innerHTML = `<strong>${num}</strong>${itemsStr}`;
		}

		clearInput() {
			this.props.el$('.new-todo').el.value = '';
		}

		onModelAction(p) {
			this.updateTextCount();
		}

		afterRender() {
			this.counterText = this.props.el$('footer span.todo-count');
			this.addChannel('CHANNEL_UI');
			this.addChannel('CHANNEL_ROUTE');
			this.addChannel('MODEL');

		}
	}

	Spyne.registerChannel(new TodosModel('MODEL'));
	const app = new App();
})(window);
