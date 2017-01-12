var Graphics = {
	Draw: function() { //this is where we will draw all the information for the game!
		Engine.Canvas.Context.clearRect(0,0,Engine.Canvas.width,Engine.Canvas.height); //clear the frame

		Graphics.DrawGUI();
		Graphics.DrawInteractables();
		Graphics.DrawReset();

		Graphics.DrawTooltip();
		
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

	DrawInteractables: function(){
		for(var i = 0; i < Engine.InteractablesList.length; i++){
			var interactable = Engine.InteractablesList[i];
			interactable.draw();
		}
	},

	

	DrawUpgrade(upgrade){
		var textColor = "white";
		if(!upgrade.gameObject.isBought && Engine.Player.Money >= upgrade.gameObject.price){
			textColor = "chartreuse";
		}

		var backgroundColor = "grey";
		if(upgrade.gameObject.isBought){
			backgroundColor = "green";
		}

		var text = upgrade.gameObject.name;
		if(!upgrade.gameObject.isBought){
			text += " - $" + upgrade.gameObject.price;
		}
		Graphics.DrawTextBox(text, upgrade.x, upgrade.y, upgrade.width, upgrade.height, backgroundColor, textColor);	
	},

	DrawWorker: function(worker){
		var backgroundColor = "grey";

		var textColor = "white";
		if(Engine.Player.Money >= worker.gameObject.price ){
			textColor = "chartreuse";
		}

		var text = worker.gameObject.name + " - $" + worker.gameObject.price;
		if(worker.gameObject.count > 0){
			text = worker.gameObject.count + " x " + text;
		}

		Graphics.DrawTextBox(text, worker.x, worker.y, worker.width, worker.height, backgroundColor, textColor);

	},



	DrawReset: function(){
		var btn = Engine.Elements.Reset;
		Graphics.DrawTextBox("X", btn.x, btn.y, btn.width, btn.height, btn.color, "yellow");
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
			Engine.Canvas.Context.globalAlpha = 0.75;
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

	DrawTextBox: function(text, x, y, width, height, boxColor, textColor, textSize){
		if(textSize === undefined){
			textSize = height - 6;
		}
		Engine.Canvas.Context.fillStyle = boxColor;
		Engine.Canvas.Context.fillRect(x, y, width, height);
		Engine.Canvas.Context.fillStyle = textColor;
		Engine.Canvas.Context.font = textSize + "px arial";
		var verticalBoxCenterForText = y + Layout.upgradeHeight - 6;
		Engine.Canvas.Context.fillText(text, x + 3, verticalBoxCenterForText);
	}
}