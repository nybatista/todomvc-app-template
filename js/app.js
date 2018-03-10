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
					route: {
						keyword: 'hashVal',
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

		onChildDisposed(o, p) {
			this.updateTextCount();
		}

		broadcastEvents() {
			return [
				['.new-todo', 'keyup', 'local'],
				['#toggle-all', 'click'],
				['button.clear-completed', 'click'],
			];
		}

		addActionMethods() {
			return [
				['CHANNEL_MODEL_INIT_TODOS_EVENT', 'onInitTodos'],
				['CHANNEL_ROUTE_.*', 'onRouteChanged'],
				['CHANNEL_UI.*', 'onUIClick'],
			];
		}

		onUIClick(item) {
			const type = R.path(['channelPayload', 'type'], item);
			const isEnterKey = R.pathEq(['event', 'key'], 'Enter', item);
			if (type === 'title-new' && isEnterKey === true) {
				const title = R.path(['srcElement', 'el', 'value'], item);
				const completed = false;
				this.addTodo({title, completed});
			}
			this.updateTextCount();
		}

		onInitTodos(p) {
			const payload = p.channelPayload;
			const addTodo = data => this.appendView(new Todo({data}), '.todo-list');
			payload.forEach(addTodo);
		}

		addTodo(data) {
			this.appendView(new Todo({data}), '.todo-list');
			this.clearInput();
		}

		onRouteChanged(p) {
			const selectedClass = R.defaultTo('',
					R.path(['channelPayload', 'routeStr']))(p);
			this.props.el$.query('ul.todo-list').
					setClass(`todo-list ${selectedClass}`);
			this.updateMenu(selectedClass);
		}

		updateMenu(r) {
			const route = r === '' ? 'home' : r;
			const selectedItem = `[data-route=${route}]`;
			this.props.el$.query('footer ul li a').
					setActiveItem(selectedItem, 'selected');
		}

		updateTextCount() {
			const num = document.querySelectorAll('.todo-list li').length;
			const itemsStr = num === 1 ? ' item left' : ' items left';
			this.props.el$.toggleClass('hide-elements', num === 0);
			this.counterText.el.innerHTML = `<strong>${num}</strong>${itemsStr}`;
		}

		clearInput() {
			this.props.el$.query('.new-todo').el.value = '';
		}

		onModelAction(p) {
			this.updateTextCount();
		}

		afterRender() {
			this.counterText = this.props.el$.query('footer span.todo-count');
			this.addChannel('UI');
			this.addChannel('ROUTE');
			this.addChannel('MODEL');

		}
	}

	Spyne.registerChannel('MODEL', new TodosModel());
	const app = new App();
})(window);
