var Upgrades = [
	{
		name: "Sharp knife",
		effect: "+1 to sushi per click",
		flavor: "The sharper the knife, the more effectively you work.",
		price: 20,
		count: 0,
		effect: function(){
			Engine.Player.SushiPerClick += 1;		
		}
	},
	{
		name: "Sharper knife",
		effect: "+ 2 to sushi per click",
		flavor: "Some knives are sharper than others",
		price: 100,
		count: 0,
		effect: function(){
			Engine.Player.SushiPerClick += 2;
		}
	},
	{
		name: "Advertise",
		effect: "+1 to sushi sold per click",
		flavor: "Any press is good press",
		price: 20,
		count: 0,
		effect: function(){
			Engine.Player.SushiPerSale += 1;
		}
	}
];
