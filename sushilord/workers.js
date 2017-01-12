Workers = [
	{
		name: "Novice panda", 
		effectDescription: "+1 to sushi per second",
		flavor: "Pandas are famous for their sushi",
		price: 10,
		count: 0,
		color: "grey",
		effect: function(){
			Engine.Player.SushiPerTick += 1;
		}
	},
	{
		name: "Cashier",
		effectDescription: "+1 to automatic selling",
		flavor:	"Not all cashiers must be pandas",
		price: 25,
		count: 0,
		color: "grey",
		effect: function(){
			Engine.Player.SalesPerTick += 1;		
		}

	}
];

