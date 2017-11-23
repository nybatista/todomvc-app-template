 class TodosModel extends Spyne.ChannelsBase {
	constructor(){


		super();

		this.counterVal = 0;


		this.observer$ = new Rx.BehaviorSubject(this.getCounterData());

		this.settings.name = 'MODEL';
/*

		this.uiChannel$ = this.getChannel("UI")
		//.do((p)=>console.log("counter ui data is ",p))
			.filter((p)=>p.data.type==="COUNTER_UPDATE")
	.subscribe((p)=>this.onCounterUpdate(p));
*/

	}


	onObserversCallback(p){

		console.log('the val is ',p);
	}





}
