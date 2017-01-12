var Engine = { //the main Engine object
	/** variables 111**/
	Info: {
		Version: 0.02
	},
	Player: {
		Sushi: 0,
		SushiPerClick: 1,
		SushiPerTick: 0,
		Money: 100,
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





	Init: function() { //an inner function "init"
		Engine.Canvas = document.createElement('canvas'); //create a canvas element
		Engine.Canvas.id = "display"; //give it an id to reference later
		Engine.Canvas.width = 800; //the width
		Engine.Canvas.height = 600; //the height
		$('body').append(Engine.Canvas); //finally append the canvas to the page

		// if (window.localStorage.getItem("sushilord-player")){
		// 	Engine.Load();
		// }

		Engine.LoadImages();

		Engine.LoadInteractables();
		Engine.AddClick();
		Engine.Autosave();
		Engine.StartIncrement();

		Engine.Canvas.Context = Engine.Canvas.getContext("2d");
		Engine.GameLoop(); //start rendering the game!
		
	},

	GameLoop: function() { //the gameloop function
		Engine.GameRunning = setTimeout(function() { 
			requestAnimFrame(Engine.Update, Engine.Canvas); 
		}, 16);
	},
	
	/** animation routines **/
	Update: function() { //this is where our logic gets updated
		Engine.CheckTooltip();
		Graphics.Draw();
		
	},


	LoadInteractables: function(){
		for(var i = 0; i < Upgrades.length; i++){
			var gameElement = {
				type: "upgrade",
				x: Layout.upgradeStartingX,
				y: Layout.upgradeStartingY + i * (Layout.gapBetweenUpgrades + Layout.upgradeHeight),
				width: Layout.upgradeWidth,
				height: Layout.upgradeHeight,
				gameObject: Upgrades[i],
				draw: function(){
					Graphics.DrawUpgrade(this);
				},
				interactable: {
					sizei: "normal",
					tooltipText: Upgrades[i].flavor
				}
			}
			Engine.InteractablesList.push(gameElement);
		}
		for(var i = 0; i < Workers.length; i++){
			var gameElement = {
				type: "worker",
				x: Layout.workerStartingX,
				y: Layout.workerStartingY + i * (Layout.gapBetweenWorkers + Layout.workerHeight),
				width: Layout.workerWidth,
				height: Layout.workerHeight,
				gameObject: Workers[i],
				draw: function(){
					Graphics.DrawWorker(this);
				},
				interactable: {
					sizei: "normal",
					tooltipText: Workers[i].flavor
				}
			}
			Engine.InteractablesList.push(gameElement);
		}

	},

	Save: function() { //save function
		window.localStorage.setItem("sushilord-info", JSON.stringify(Engine.Info)); //set localstorage for engine info
		window.localStorage.setItem("sushilord-player", JSON.stringify(Engine.Player)); //set localstorage for player
		window.localStorage.setItem("sushilord-upgrades", JSON.stringify(Upgrades)); //set localstorage for upgrades
		window.localStorage.setItem("sushilord-workers", JSON.stringify(Workers)); //set localstorage for workers
	},
	Load: function() { //load function
		if (window.localStorage.getItem("sushilord-info")) {
			var version = JSON.parse(window.localStorage.getItem("sushilord-info"));
			if (version.Version <= Engine.Info.Version) {
				Engine.Player = JSON.parse(window.localStorage.getItem("sushilord-player")); //load player
				Upgrades = JSON.parse(window.localStorage.getItem("sushilord-upgrades")); //load upgrades
				Workers = JSON.parse(window.localStorage.getItem("sushilord-workers")); //load workers
				Engine.Save(); //resave the new versioned data
				Engine.Info = JSON.parse(window.localStorage.getItem("sushilord-info"));
			}else {
				Engine.Info = JSON.parse(window.localStorage.getItem("sushilord-info"));
				Engine.Player = JSON.parse(window.localStorage.getItem("sushilord-player")); //load player
				Upgrades = JSON.parse(window.localStorage.getItem("sushilord-upgrades")); //load upgrades
				Workers = JSON.parse(window.localStorage.getItem("sushilord-workers")); //load workers
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
		for (var i = 0; i < Images.length; i++) { 
    		Images[i].Image.src = Images[i].File;
    		Images[i].draw = function(){
				Engine.Canvas.Context.drawImage(this.Image, this.x, this.y, this.width, this.height);
    		};
    		Engine.InteractablesList.push(Images[i]);
		}

		// Images.ClickArea.Image.src = Images.ClickArea.File;
		// Images.SellArea.Image.src = Images.SellArea.File;
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

	BuyItem: function(interactable){
		AdjustPrice = function(item) {
			item.price = Math.round(item.price * 1.25);
		};

		if(interactable.gameObject.price > Engine.Player.Money){ return false;}
		if(interactable.type === "upgrade" && interactable.gameObject.count > 0){ return false;}

		Engine.Player.Money += -interactable.gameObject.price;

		if(interactable.type !== "upgrade"){
			AdjustPrice(interactable.gameObject);
		}
		interactable.gameObject.count += 1;

		return true;
	},

	AddClick: function() {
		$(Engine.Canvas).on('mousedown', function(mouse) {
			Engine.CheckImagesDown(mouse);
			Engine.CheckWorkers(mouse, "down");		
		});
		$(Engine.Canvas).on('mouseup', function(mouse){
			Engine.CheckImagesUp(mouse);
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
		var img = Images[0];
		if (Engine.isOnMouse(mouse, img.x, img.x + img.width, img.y, img.y + img.height)){
			Engine.resize(img, 0, 4, -8, -8);
		}
		img = Images[1];
		if (Engine.isOnMouse(mouse, img.x, img.x + img.width, img.y, img.y + img.height)){
			Engine.resize(img, 0, 4, -8, -8);
		}
	},

	CheckImagesUp: function(mouse){
		var img = Images[0];
		if (Engine.isOnMouse(mouse, img.x, img.x + img.width, img.y, img.y + img.height)){
			Engine.resize(img, 0, -4, 8, 8);
			Engine.Player.Sushi += Engine.Player.SushiPerClick;
		}
		img = Images[1];
		if (Engine.isOnMouse(mouse, img.x, img.x + img.width, img.y, img.y + img.height)){
			Engine.resize(img, 0, -4, 8, 8);
			Engine.SellSushiManual();
		}
	},

	CheckWorkers: function(mouse, type){0
		for(var i = 0; i < Engine.InteractablesList.length; i++){
			var interactable = Engine.InteractablesList[i];

			var isMouseClickOverInteractable = Engine.isOnMouse(mouse, interactable.x, interactable.x + interactable.width, interactable.y, interactable.y + interactable.height);
			if(type !== "down" || !isMouseClickOverInteractable) {continue;}

			if(interactable.type === "worker" || interactable.type === "upgrade"){
				var buyingSuccessful = Engine.BuyItem(interactable);
				if(buyingSuccessful){
					interactable.gameObject.effect();
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
			var object = Engine.InteractablesList[i];
			var interactable = object.interactable;
			isMouseOnInteractable = Engine.isOnMouse(mouse, object.x, object.x + object.width, object.y, object.y + object.height);
			if(isMouseOnInteractable){
				//console.log("Mouse x: " + mouse.pageX + " y: " + mouse.pageY + " entered on object between  x1:" + object.x + " x2: " + (object.x + object.width) + " y1: " + y)
				Engine.Tooltip.interactable = interactable;
				Engine.Tooltip.x = mouse.pageX;
				Engine.Tooltip.y = mouse.pageY;

				if(interactable.sizei !== "normal"){
					return;
				}
				Engine.NormalizeLastHover();
				//Engine.resize(object, 0, -4, 8, 8)
				Engine.Enlarge(object);
				interactable.sizei = "big";
				Engine.LastHover = object;				
				return;
			}
		}
		Engine.NormalizeLastHover();
		Engine.Tooltip.interactable = null;
	},

	NormalizeLastHover: function(){
		if(Engine.LastHover != undefined){
				//Engine.resize(Engine.LastHover, 0, 4, -8, -8);
				Engine.Compress(Engine.LastHover);
				Engine.LastHover.interactable.sizei = "normal";
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

	Enlarge: function(element){
		var offsets = Layout.resizeMap[element.type];
		if(offsets === undefined) {return;}

		Engine.resize(element, offsets.xOffset, offsets.yOffset, offsets.widthOffset, offsets.heightOffset)

	},

	Compress: function(element){
		var offsets = Layout.resizeMap[element.type];
		if(offsets === undefined) {return;}

		Engine.resize(element, -offsets.xOffset, -offsets.yOffset, -offsets.widthOffset, -offsets.heightOffset)

	},

	resize: function(element, xOffset, yOffset, widthOffset, heightOffset) {
		
		element.x += xOffset;
		element.y += yOffset;
		element.width += widthOffset;
		element.height += heightOffset;
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