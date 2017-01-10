var Engine = { //the main Engine object
	/** variables **/
	Info: {
		Version: 0.02
	},
	Player: {
		Sushi: 0,
		SushiPerClick: 1,
		SushiPerTick: 0,
		Money: 0,
		SushiPerSale: 1,
		SushiPrice: 1,
		SalesPerTick: 0,
		PriceIncrement: 1.25
	},
	Elements: {
		Upgrade: {
			x: 250, y: 5, width: 200, height: 20
		},
		Worker: {
			x: null, y: 5, width: 250, height: 20
		},
		Reset: {
			x: 690, y: 290, width: 15, height: 20, color: "red"
		}
	},
	Images: [
		{name: "click area", File: "img/sushi.png", x: 20, y: 80, width: 130, height: 130, Image: new Image(), sizei: "normal", tooltipText: "Press me for sushi!" },
		{name: "sell area", File: "img/money.png", x: 20, y: 200, width: 130, height: 130, Image: new Image(), sizei: "normal", tooltipText: "I, on the other hand, am more sophistacated, and thus required a significantly longer tooltip. You are welcome to read. Here it goes: press me to sell sushi!" }
	],

	Timers: {
		Increment: null,
		Autosave: null
	},

	Canvas: { //the canvas object
		Element: null, //this will be a canvas element
		Context: null //this will become a 2d context
	},

	Buttons: {
		Save: {
			text: "Save"
		},
		Rset: {
			text: "Reset"
		}
	},

	InteractablesList: [],

	Upgrades: [
		{
			name: "Sharp knife",
			effect: "+1 to sushi per click",
			flavor: "The sharper the knife, the more effectively you work.",
			price: 20,
			color: "grey",
			isBought: false},
		{
			name: "Sharper knife",
			effect: "+ 2 to sushi per click",
			flavor: "Some knives are sharper than others",
			price: 100,
			color: "grey",
			isBought: false},
		{
			name: "Advertise",
			effect: "+1 to sushi sold per click",
			flavor: "Any press is good press",
			price: 20,
			color: "grey",
			isBought: false}
	],

	UpgradeButtons: [],

	Workers: [
		{
			name: "Novice panda", 
			effect: "+1 to sushi per second",
			flavor: "Pandas are famous for their sushi",
			price: 10,
			count: 0,
			color: "grey",
			isBought: false},
		{
			name: "Cashier",
			effect: "+1 to automatic selling",
			flavor:	"Not all cashiers must be pandas",
			price: 25,
			count: 0,
			color: "grey",
			isBought: false}
	],

	Tooltip:{
		isEnabled: false,
		x: null,
		y: null,
		width: null,
		height: null,
		text: null,
		interactable: null,
		timeAlive: null,
		lastUpdate: null,
		maxWidth: 100
	},

	BuySharpKnife: function(){
		var item = Engine.Upgrades[0];

		if(Engine.Player.Money >= item.price && !item.isBought){
			Engine.Player.Money += -item.price;
			Engine.Player.SushiPerClick += 1;
			item.isBought = true;
		}
	},

	BuySharperKnife: function(){
		var item = Engine.Upgrades[1];
		
		if(Engine.Player.Money >= item.price && !item.isBought){
			Engine.Player.Money += -item.price;
			item.isBought = true;

			Engine.Player.SushiPerClick += 2;
		}
	},

	BuyAdvertise: function(){
		var item = Engine.Upgrades[2];

		if(Engine.Player.Money >= item.price && !item.isBought){
		Engine.Player.Money += -item.price;
		item.isBought = true;

		Engine.Player.SushiPerSale += 1;
		}
	},

	BuyNovicePanda: function(){
		var item = Engine.Workers[0];
		
		if(Engine.Player.Money >= item.price){
			Engine.Player.Money += -item.price;
			Engine.AdjustPrice(item);
			item.count += 1;

			Engine.Player.SushiPerTick += 1;
		}
	},

	BuyCashier: function(){
		var item = Engine.Workers[1];
		
		if(Engine.Player.Money >= item.price){
			Engine.Player.Money += -item.price;
			Engine.AdjustPrice(item);
			item.count += 1;

			Engine.Player.SalesPerTick += 1;
		}
	},

	AdjustPrice: function(item) {
		item.price = Math.round(item.price * 1.25);
	},
	
	Init: function() { //an inner function "init"
		Engine.Canvas = document.createElement('canvas'); //create a canvas element
		Engine.Canvas.id = "display"; //give it an id to reference later
		Engine.Canvas.width = 800; //the width
		Engine.Canvas.height = 600; //the height
		$('body').append(Engine.Canvas); //finally append the canvas to the page

		if (window.localStorage.getItem("sushilord-player")){
			Engine.Load();
		}

		Engine.LoadImages();
		Engine.SetConstants();

		Engine.RegisterButtons();
		Engine.AddClick();
		Engine.Autosave();
		Engine.StartIncrement();

		Engine.Canvas.Context = Engine.Canvas.getContext("2d");
		Engine.GameLoop(); //start rendering the game!
		
	},

	SetConstants: function(){
		Engine.Elements.Worker.x = Engine.Elements.Upgrade.x + Engine.Elements.Upgrade.width + 10;
	},

	RegisterButtons: function(){
		
	}

	Save: function() { //save function
		window.localStorage.setItem("sushilord-info", JSON.stringify(Engine.Info)); //set localstorage for engine info
		window.localStorage.setItem("sushilord-player", JSON.stringify(Engine.Player)); //set localstorage for player
		window.localStorage.setItem("sushilord-upgrades", JSON.stringify(Engine.Upgrades)); //set localstorage for upgrades
		window.localStorage.setItem("sushilord-workers", JSON.stringify(Engine.Workers)); //set localstorage for workers
	},
	Load: function() { //load function
		if (window.localStorage.getItem("sushilord-info")) {
			var version = JSON.parse(window.localStorage.getItem("sushilord-info"));
			if (version.Version <= Engine.Info.Version) {
				Engine.Player = JSON.parse(window.localStorage.getItem("sushilord-player")); //load player
				Engine.Upgrades = JSON.parse(window.localStorage.getItem("sushilord-upgrades")); //load upgrades
				Engine.Workers = JSON.parse(window.localStorage.getItem("sushilord-workers")); //load workers
				Engine.Save(); //resave the new versioned data
				Engine.Info = JSON.parse(window.localStorage.getItem("sushilord-info"));
			}else {
				Engine.Info = JSON.parse(window.localStorage.getItem("sushilord-info"));
				Engine.Player = JSON.parse(window.localStorage.getItem("sushilord-player")); //load player
				Engine.Upgrades = JSON.parse(window.localStorage.getItem("sushilord-upgrades")); //load upgrades
				Engine.Workers = JSON.parse(window.localStorage.getItem("sushilord-workers")); //load workers
			}
		} 
	},

	Reset: function() { //delete save function
		var areYouSure = confirm("Are you sure?\r\nYOU WILL LOSE YOUR SAVE!!"); //make sure the user is aware
		if (areYouSure === true) { //if they click yep
			window.localStorage.setItem("sushilord-player", null); //delete
			window.localStorage.setItem("sushilord-upgrades", null); //delete
			window.localStorage.setItem("sushilord-workers", null); //delete
			window.localStorage.removeItem("sushilord-player"); //delete
			window.localStorage.removeItem("sushilord-upgrades"); //delete
			window.localStorage.removeItem("sushilord-workers"); //delete
			window.location.reload(); //refresh page to restart
		}
	},
	

	LoadImages: function() { //this is where our logic gets updated
		for (var i = 0; i < Engine.Images.length; i++) { 
    		Engine.Images[i].Image.src = Engine.Images[i].File;
    		Engine.InteractablesList.push(Engine.Images[i]);
		}

		// Engine.Images.ClickArea.Image.src = Engine.Images.ClickArea.File;
		// Engine.Images.SellArea.Image.src = Engine.Images.SellArea.File;
	},

	Autosave: function(){
		Engine.Timers.Autosave = setInterval(function(){
			Engine.Save();
		}, 10000); 
	},

	StartIncrement: function() {
		Engine.Timers.Increment = setInterval(function() {
			Engine.Player.Sushi += Engine.Player.SushiPerTick;
			if(Engine.Player.Sushi > 0){
				if(Engine.Player.SalesPerTick >= Engine.Player.Sushi){
					Engine.SellSushi(Engine.Player.Sushi);
				}			
				else{
					Engine.SellSushi(Engine.Player.SalesPerTick);
				}
			}
		}, 1000);
	},

	SellSushi : function(SushiAmount) {
		Engine.Player.Sushi += -SushiAmount;
		Engine.Player.Money += SushiAmount * Engine.Player.SushiPrice; 
	},

	SellSushiManual : function(){
		if(Engine.Player.Sushi > 0){
			var SushiToSell;
			if(Engine.Player.Sushi < Engine.Player.SushiPerSale){
				SushiToSell = Engine.Player.Sushi;
			}
			else{
				SushiToSell = Engine.Player.SushiPerSale;
			}
			Engine.Player.Sushi += -SushiToSell;
			Engine.Player.Money += SushiToSell * Engine.Player.SushiPrice;
		}
	},

	AddClick: function() {
		$(Engine.Canvas).on('mousedown', function(mouse) {
			Engine.CheckImagesDown(mouse);
			Engine.CheckUpgrades(mouse, "down");
			Engine.CheckWorkers(mouse, "down");		
		});
		$(Engine.Canvas).on('mouseup', function(mouse){
			Engine.CheckImagesUp(mouse);
			Engine.CheckUpgrades(mouse, "up");
			Engine.CheckWorkers(mouse, "up");
			Engine.CheckReset(mouse);	
		});
		$(Engine.Canvas).on('mousemove', function(mouse) {
			Engine.HandleHovering(mouse);
		});
	},

	isOnMouse: function(mouse, x1, x2, y1, y2) {
		var mouseX = mouse.pageX;
		var mouseY = mouse.pageY;


		if(mouseX >= x1 && mouseX <= x2){
			if(mouseY >= y1 && mouseY <= y2){
				return true;
			}
		}
		// console.log("ItemX: " + item.x + " mouseX: " + mouse.pageX + " ItemWidth: " + item.width +
		// 	"\nItemY: " + item.y + " mouseY: " + mouse.pageY + " ItemHeight: " + item.height);
		return false;
	},

	CheckImagesDown: function(mouse){
		var img = Engine.Images[0];
		if (Engine.isOnMouse(mouse, img.x, img.x + img.width, img.y, img.y + img.height)){
			Engine.resize(img, 0, 4, -8, -8);
		}
		img = Engine.Images[1];
		if (Engine.isOnMouse(mouse, img.x, img.x + img.width, img.y, img.y + img.height)){
			Engine.resize(img, 0, 4, -8, -8);
		}
	},

	CheckImagesUp: function(mouse){
		var img = Engine.Images[0];
		if (Engine.isOnMouse(mouse, img.x, img.x + img.width, img.y, img.y + img.height)){
			Engine.resize(img, 0, -4, 8, 8);
			Engine.Player.Sushi += Engine.Player.SushiPerClick;
		}
		img = Engine.Images[1];
		if (Engine.isOnMouse(mouse, img.x, img.x + img.width, img.y, img.y + img.height)){
			Engine.resize(img, 0, -4, 8, 8);
			Engine.SellSushiManual();
		}
	},

	CheckUpgrades: function(mouse, type){
		for(var i = 0; i < Engine.Upgrades.length; i++){
			var dims = Engine.Elements.Upgrade;
			var y = dims.y + i * 27;
			if(Engine.isOnMouse(mouse, dims.x, dims.x + dims.width, y, y + dims.height)){
				var upgrade = Engine.Upgrades[i];
				if(type === "down"){
					upgrade.color = "CadetBlue";
				}else{
					Engine.UpgradeMap(i);
					upgrade.color = "grey";
				}
			}
		}	
	},


	CheckWorkers: function(mouse, type){
		for(var i = 0; i < Engine.Workers.length; i++){
			var dims = Engine.Elements.Worker;
			var y = 5 + i * 27;
			if(Engine.isOnMouse(mouse, dims.x, dims.x + dims.width, y, y + dims.height)){
				var worker = Engine.Workers[i];
				if(type === "down"){
					worker.color = "CadetBlue";
				}else{
					Engine.WorkerMap(i);
					worker.color = "grey";
				}
			}
		}	
	},

	CheckReset: function(mouse){
		var dims = Engine.Elements.Reset;
		if(Engine.isOnMouse(mouse, dims.x, dims.x + dims.width, dims.y - dims.height, dims.y)){
			Engine.Reset();
		}
		// else{
		// 	console.log(dims.x + " " + mouse.pageX + " " + (dims.x + dims.width) +
		// 				"\n" + dims.y + " " + mouse.pageY + " " + (dims.y + dims.height));
		// }
	},

	LastHover: null,
	canDrawTooltip: false,

	HandleHovering: function(mouse){
		for (var i = 0; i < Engine.InteractablesList.length; i++) {
			var interactable = Engine.InteractablesList[i];
			isMouseOnInteractable = Engine.isOnMouse(mouse, interactable.x, interactable.x + interactable.width, interactable.y, interactable.y + interactable.height);
			if(isMouseOnInteractable){
				Engine.Tooltip.interactable = interactable;
				Engine.Tooltip.x = mouse.pageX;
				Engine.Tooltip.y = mouse.pageY;

				if(interactable.sizei !== "normal"){
					return;
				}
				Engine.NormalizeLastHover();
				Engine.resize(interactable, 0, -4, 8, 8)
				interactable.sizei = "big";
				Engine.LastHover = interactable;				
				return;
			}
		}
		Engine.NormalizeLastHover();
		Engine.Tooltip.interactable = null;
	},

	NormalizeLastHover: function(){
		if(Engine.LastHover != undefined){
				Engine.resize(Engine.LastHover, 0, 4, -8, -8);
				Engine.LastHover.sizei = "normal";
				Engine.LastHover = null;
			}
	},

	UpgradeMap: function(id){
		switch(id){
			case 0:
				Engine.BuySharpKnife();
				break;
			case 1:
				Engine.BuySharperKnife();
				break;
			case 2:
				Engine.BuyAdvertise();
				break;
		}
	},

	WorkerMap: function(id){
		switch(id){
			case 0:
				Engine.BuyNovicePanda();
				break;
			case 1:
				Engine.BuyCashier();
				break;
		}
	},

	resize: function(item, xOffset, yOffset, widthOffset, heightOffset) {
		item.x += xOffset;
		item.y += yOffset;
		item.width += widthOffset;
		item.height += heightOffset;
	},

	
	/** animation routines **/
	Update: function() { //this is where our logic gets updated
		Engine.CheckTooltip();
		Engine.Draw();
		
	},

	CheckTooltip: function(){
		Engine.Tooltip.isEnabled = false;
		if(Engine.Tooltip.interactable === null){
			Engine.Tooltip.timeAlive = null;
			return;
		}
		if(Engine.Tooltip.timeAlive === null){
			Engine.Tooltip.timeAlive = 0;
			Engine.Tooltip.lastUpdate = Date.now();
		}
		else{
			var currentTime = Date.now();
			Engine.Tooltip.timeAlive += currentTime - Engine.Tooltip.lastUpdate;
			Engine.Tooltip.lastUpdate = currentTime;
		}
		if(Engine.Tooltip.timeAlive > 500){
			Engine.Tooltip.isEnabled = true;
		}

	},

	Draw: function() { //this is where we will draw all the information for the game!
		Engine.Canvas.Context.clearRect(0,0,Engine.Canvas.width,Engine.Canvas.height); //clear the frame

		Engine.DrawGUI();
		Engine.DrawImages();
		Engine.DrawUpgrades();
		Engine.DrawWorkers();
		Engine.DrawReset();

		Engine.DrawTooltip();
		
		Engine.GameLoop(); //re-iterate back to gameloop
	},

	DrawGUI: function(){
		var SushiText = "Sushi:   " + Engine.Player.Sushi + " (" + Engine.Player.SushiPerClick + ")" + " | " + Engine.Player.SushiPerTick + "/s";
		var MoneyText = "Money: " + Engine.Player.Money + " (" + Engine.Player.SushiPerSale + ")" +  " | " + Engine.Player.SalesPerTick + "/s";

		Engine.Canvas.Context.fillStyle = "grey";
		Engine.Canvas.Context.font = "20px arial";
		Engine.Canvas.Context.fillText(SushiText, 20, 20);
		Engine.Canvas.Context.fillText(MoneyText, 21, 40);
	},

	DrawImages: function(){
		for (var i = 0; i < Engine.Images.length; i++) {
			var img = Engine.Images[i];
			Engine.Canvas.Context.drawImage(img.Image, img.x, img.y, img.width, img.height);
		}

	},

	DrawUpgrades: function(){
		for (var i = 0; i < Engine.Upgrades.length; i++){
			// dimensions
			var dims = Engine.Elements.Upgrade;
			var upgrade = Engine.Upgrades[i];
			var text = upgrade.name + " - $" + upgrade.price;
			var textColor = "white";
			var boxColor = upgrade.color;

			if(upgrade.isBought){
				boxColor = "limegreen";
			}else if(upgrade.price <= Engine.Player.Money){
				textColor = "chartreuse";
			}
			
			Engine.DrawTextBox(text, dims.x, dims.y + dims.height + i * 27, dims.width, dims.height, boxColor, textColor);
		}
	},


	DrawWorkers: function(){
		for (var i = 0; i < Engine.Workers.length; i++){			
			var dims = Engine.Elements.Worker;
			var worker = Engine.Workers[i];
			var count = "";
			if(worker.count > 0){
				count = worker.count + " x ";
			}
			var text = count + worker.name + " - $" + worker.price;
			var textColor = "white";
			if (worker.price <= Engine.Player.Money){
				textColor = "chartreuse";
			}
			Engine.DrawTextBox(text, dims.x, dims.y + dims.height + i * 27, dims.width, dims.height, worker.color, textColor);
		}
	},

	DrawReset: function(){
		var btn = Engine.Elements.Reset;
		Engine.DrawTextBox("X", btn.x, btn.y, btn.width, btn.height, btn.color, "yellow");
	},

	DrawTooltip: function(){
		if(!Engine.Tooltip.isEnabled){return}

		var tooltipTextLines = GetLinesFromText(Engine.Tooltip.interactable.tooltipText);
		var tooltipWidth = Math.max((20 + 8.5 * tooltipTextLines[0].length), 50);
		var tooltipHeigth = 20 + tooltipTextLines.length * 20;
		DrawTooltipBorder(tooltipWidth, tooltipHeigth);
		FillTooltip(tooltipWidth, tooltipHeigth);
		WriteTooltipText();

		function GetLinesFromText(sourceText){
			
			var lines = [];
			var line = "";
			var lineLength = 0;

			for(var i = 0; i < sourceText.length; i++){
				line += sourceText[i];
				lineLength++;

				if(lineLength > 20){
					lines.push(line);
					line = "";
					lineLength = 0;
				}
			}
			if(lineLength > 0){
				lines.push(line);
			}

			return lines;
		}



		function DrawTooltipBorder(width, height){
			Engine.Canvas.Context.fillStyle = "black";
			Engine.Canvas.Context.strokeRect(Engine.Tooltip.x, Engine.Tooltip.y, width, height);
		}

		function FillTooltip(width, height){
			Engine.Tooltip.width = 200;
			Engine.Canvas.Context.fillStyle = "white";
			Engine.Canvas.Context.globalAlpha = 0.4;
			Engine.Canvas.Context.fillRect(Engine.Tooltip.x, Engine.Tooltip.y, width, height);
			Engine.Canvas.Context.globalAlpha = 1;
		}

		function WriteTooltipText(){
			Engine.Canvas.Context.fillStyle = "black";
			Engine.Canvas.Context.font = "18px arial";


			var source = Engine.Tooltip.interactable.tooltipText;
			var lines = GetLinesFromText(source)
			var line = Engine.Tooltip.interactable.tooltipText;
			var numOfLines = 10;
					
			for(var i = 0; i < lines.length; i++){
				line = lines[i];
				Engine.Canvas.Context.fillText(line, Engine.Tooltip.x + 10, Engine.Tooltip.y + 20 + (20 * i));
			}

		}

		
		





	},

	DrawItem: function(item){
		Engine.Canvas.Context.drawImage(item.Image, item.x, item.y, item.width, item.height);
	},

	DrawTextBox: function(text, x, y, width, height, boxColor, textColor){
		Engine.Canvas.Context.fillStyle = boxColor;
		Engine.Canvas.Context.fillRect(x, y - height, width, height * 1.25);
		Engine.Canvas.Context.fillStyle = textColor;
		Engine.Canvas.Context.font = height + "px arial";
		Engine.Canvas.Context.fillText(text, x, y);

	},

	GameLoop: function() { //the gameloop function
		Engine.GameRunning = setTimeout(function() { 
			requestAnimFrame(Engine.Update, Engine.Canvas); 
		}, 10);
	},
	
	/** drawing routines **/
	Image: function(img,x,y,w,h,opac) { //image drawing function, x position, y position, width, height and opacity
		if (opac) { //if opacity exists
			Engine.Canvas.Context.globalAlpha = opac; //amend it
		}
		Engine.Canvas.Context.drawImage(img,x,y,w,h); //draw image
		Engine.Canvas.Context.globalAlpha = 1.0; //reset opacity
	},
	Text: function(text, x, y, font, size, col) { //the text, x position, y position, font (arial, verdana etc), font size and colour
		if (col.length > 0) { //if you have included a colour
			Engine.Canvas.Context.fillStyle = col; //add the colour!
		}
		Engine.Canvas.Context.font = size + "px " + font;
		Engine.Canvas.Context.fillText(text,x,y);
	}
};
/** This is a request animation frame function that gets the best possible animation process for your browser, I won't go into specifics; just know it's worth using ;) **/
window.requestAnimFrame = (function(){
	return window.requestAnimationFrame || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame || 
		window.oRequestAnimationFrame || 
		window.msRequestAnimationFrame || 
	function (callback, element){
		var fpsLoop = window.setTimeout(callback, 1000 / 60);
	};
}());
window.onload = Engine.Init(); //the engine starts when window loads