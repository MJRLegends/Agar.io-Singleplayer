//Sprite object
var spriteObject = {
    sourceX: 0,
    sourceY: 0,
    sourceWidth: 64,
    sourceHeight: 64,
    width: 64,
    height: 64,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
	eaten: false,
	
	//Getters
    centerX: function() {
        return this.x + (this.width / 2);
    },
    centerY: function() {
        return this.y + (this.height / 2);
    },
    halfWidth: function() {
        return this.width / 2;
    },
    halfHeight: function() {
        return this.height / 2;
    }
};

//Button object
var buttonObject = {
    width: 64,
    height: 64,
    x: 0,
    y: 0,
	text: "",
	textOffsetX: 0,
	textOffsetY: 0
};

//The canvas and its drawing surface
var canvas = document.querySelector("canvas");
var drawingSurface = canvas.getContext("2d");

var sprites = []; //An array to store the sprites
var menuButtons = []; //An array to store the main menu buttons
var pausedButtons = []; //An array to store the pasued menu buttons

var map = []; //An array to store the map

//Load the image
var image = new Image();
image.addEventListener("load", gameMain, false);
image.src = "images/spritesheet.png";

//Arrow key codes
var UP = 38;
var DOWN = 40;
var RIGHT = 39;
var LEFT = 37;
var W = 87;
var Space = 32;
var ESC = 27;

//Directions
var moveUp = false;
var moveDown = false;
var moveRight = false;
var moveLeft = false;
var pressedESC = false;
var paused = false;
var gameStarted = false;

//Variables are set to actual values when the game is Started/Reset
var playerspeed = 0; // Used for player speed
var spawned = false; // Used to check if the lines/platforms have been spawned
var gameStart = false; // Used to check if game has been started
var player; // Used to store the player sprite object
var score = 0; // Used for the score
var lineTick = 0; // Used to store the number for calculating score
var highestscore = 0; // Used store the players highest score
var currentScreen = "mainMenu"; // Used store the current screen

//Event listeners
window.addEventListener("keydown", function(event) {
    switch (event.keyCode) {
        case UP:
			moveUp = true;
			break;
		case DOWN:
			moveDown = true;
			break;
		case RIGHT:
			moveRight = true;
			break;
		case LEFT:
			moveLeft = true;
			break;
		case ESC:
			if(pressedESC)
				pressedESC = false;
			else 
				pressedESC = true;
            break;
    }
}, false);

window.addEventListener("keyup", function(event) {
    switch (event.keyCode) {
        case UP:
			moveUp = false;
			break;
		case DOWN:
			moveDown = false;
			break;
		case RIGHT:
			moveRight = false;
			break;
		case LEFT:
			moveLeft = false;
			break;
    }
}, false);

window.addEventListener("mousedown", function(event) {
	var mousePos = getMousePos(canvas, event);
	var x = mousePos.x;
	var y = mousePos.y;
	var buttonTempX = (canvas.width / 2) - 100;
	var buttonTempY = 200;
	
	if(currentScreen == "mainMenu"){ // Main Menu inputs
		if(x >= buttonTempX && x <= (buttonTempX + 200))
			if(y >= buttonTempY && y <= (buttonTempY + 60)){
				gameStart = false;
				gameStarted = true;
				currentScreen = "game";
			}
			else if(y >= buttonTempY + 100 && y <= (buttonTempY + 60) + 100)
				currentScreen = "settings";
	}
	else if(currentScreen == "game" && paused){ // Paused Menu inputs
		if(x >= buttonTempX && x <= (buttonTempX + 200))
			if(y >= buttonTempY && y <= (buttonTempY + 60)){
				currentScreen = "mainMenu";
				pressedESC = false;
				gameStarted = false;
				paused = false;
			}
	}
}, false);

function getMousePos(canvas, evt){ // Gets the mouse coords from the canva
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function gameMain(){ // Main method
	loadButtons();
	update();
}

function loadButtons(){ // Creates the buttons
	//Creates the Start Game button
	var tempbutton = Object.create(buttonObject);
	tempbutton.x = (canvas.width / 2) - 100;
	tempbutton.y = 200;
	tempbutton.text = "Start Game";
	tempbutton.textOffsetX = 28;
	tempbutton.textOffsetY = 35;
	menuButtons.push(tempbutton);
	
	//Creates the Back to menu buttons for the pause menu
	tempbutton = Object.create(buttonObject);
	tempbutton.x = (canvas.width / 2) - 100;
	tempbutton.y = 200;
	tempbutton.text = "Back to menu";
	tempbutton.textOffsetX = 15;
	tempbutton.textOffsetY = 35;
	pausedButtons.push(tempbutton);	
}

function update(){ // Update Method
	//The animation loop
	requestAnimationFrame(update, canvas);
	
	if(gameStarted){ // Start the game if true
		if(pressedESC)
			paused = true;
		else 
			paused = false;
		if(paused == false){
			if (gameStart == false) { // Starts/Resets the game
				gameStart = true;
				sprites = []; // Clears the sprite array
				playerspeed = 3;
				lineTick = 1;
				score = 0;
				//Create the player
				player = Object.create(spriteObject);
				player.sourceX = 64;
				player.x = canvas.width - (canvas.width / 2);
				player.y = canvas.height - (canvas.height / 2);
				player.width = 32;
				player.height = 32;
				sprites.push(player);
				loadMap();
			} else {
				//Player movement
				//Up
				if(moveUp && !moveDown)
				{
					player.vy = -2;
				}
				
				//Down
				if(moveDown && !moveUp)
				{
					player.vy = 2;
				}
				
				//Left
				if(moveLeft && !moveRight)
				{
					player.vx = -2;
				}
				
				//Right
				if(moveRight && !moveLeft)
				{
					player.vx = 2;
				}

				//Set the player's velocity to zero if none of the keys are being pressed
				if(!moveUp && !moveDown)
				{
					player.vy = 0;
				}
				if(!moveLeft && !moveRight)
				{
					player.vx = 0;
				}
				//Move the player
				player.x += player.vx;
				player.y += player.vy;
				
				for(var i = 0; i < map.length; i++){
					if(player.vx != 0){
						map[i].x = map[i].x - player.vx * 2;
					}
					if(player.vy != 0){
						map[i].y = map[i].y - player.vy * 2;
					}					
				}				

				//Collision detection to make sure the player cant go off the canvas
				if (player.x < 0)
					player.x = 0;

				if (player.y < 0) { // If the player hits the top/ Game Over!
					player.y = 0;
				}
				
				if (player.x + player.width > canvas.width)
					player.x = canvas.width - player.width;
				if (player.y + player.height > canvas.height)
					player.y = canvas.height - player.height;
				if(map.length != 0)
					for(var i = 0; i < map.length; i++){
						if(blockCircle(player, map[i]) != "none"){
							if(map[i].width == 16 && map[i].height == 16 && map[i].eaten == false){
								map[i].sourceX=320;
								map[i].eaten = true;
								score++;
								sprites[0].width = sprites[0].width + 0.5;
								sprites[0].height = sprites[0].height + 0.5;
							}
						}
					}
			}
		}
	}
	render(); //Render the screen
}

function loadMap(){
	for(var i = 0; i < 1000; i++){
		var sourceX = 0;
		var random = Math.floor((Math.random() * 3) + 0);
		switch(random){
			case 0:
				sourceX = 0;
				break;
			case 1:
				sourceX = 64;
				break;
			case 2:
				sourceX = 128;
				break;
			case 3:
				sourceX = 192;
				break;
		}
		var temp;
		temp = Object.create(spriteObject);
		temp.sourceX = sourceX;
		temp.x = Math.floor((Math.random() * (canvas.width + 2000)) + 0);
		temp.y = Math.floor((Math.random() * (canvas.height + 2000)) + 0);
		temp.width = 16;
		temp.height = 16;
		map.push(temp);
	}
	for(var i = 0; i < 150; i++){
		var temp;
		temp = Object.create(spriteObject);
		temp.sourceX = 0;
		temp.x = Math.floor((Math.random() * (canvas.width + 2000)) + 0) + 250;
		temp.y = Math.floor((Math.random() * (canvas.height + 2000)) + 0) + 250;
		var size = Math.floor((Math.random() * 32) + 97);
		temp.width = size;
		temp.height = size;
		map.push(temp);
	}
}

function blockCircle(c1, c2)
{  
  //Calculate the vector between the circles’ center points
  var vx = c1.centerX() - c2.centerX();
  var vy = c1.centerY() - c2.centerY();
  
  //Find the distance between the circles by calculating
  //the vector's magnitude (how long the vector is) 
  var magnitude = Math.sqrt(vx * vx + vy * vy);
  
  //Add together the circles' combined half-widths
  var totalRadii = c1.halfWidth() + c2.halfWidth();
  
  //Figure out if there's a collision
  if(magnitude < totalRadii)
  {
	return "collision";
  }
  else
	  return "none";
}

function render() {
	//Clears the screen
	drawingSurface.fillStyle = "white";
    drawingSurface.fillRect(0, 0, canvas.width, canvas.height);
	if (sprites.length !== 0) {
		//Render each sprite in the array
		drawingSurface.shadowOffsetX = 0;
		drawingSurface.shadowOffsetY = 0;
		drawingSurface.shadowBlur = 0;
		drawingSurface.shadowColor="#000000";
		for (var i = 0; i < map.length; i++) {
			if(map[i].width == 16 && map[i].height == 16 ){
				var sprite = map[i];
				//Draws image to the canvas
				drawingSurface.drawImage(
					image,
					sprite.sourceX, sprite.sourceY,
					sprite.sourceWidth, sprite.sourceHeight,
					Math.floor(sprite.x), Math.floor(sprite.y),
					sprite.width, sprite.height
				);
			}
		}
		
		for (var i = 0; i < sprites.length; i++) {
			var sprite = sprites[i];
			//Draws image to the canvas
			drawingSurface.drawImage(
				image,
				sprite.sourceX, sprite.sourceY,
				sprite.sourceWidth, sprite.sourceHeight,
				Math.floor(sprite.x), Math.floor(sprite.y),
				sprite.width, sprite.height
			);
		}
		for (var i = 0; i < map.length; i++) {
			if(map[i].width != 16 && map[i].height != 16 ){
				var sprite = map[i];
				//Draws image to the canvas
				drawingSurface.drawImage(
					image,
					sprite.sourceX, sprite.sourceY,
					sprite.sourceWidth, sprite.sourceHeight,
					Math.floor(sprite.x), Math.floor(sprite.y),
					sprite.width, sprite.height
				);
			}
		}
		
		//Renders game based text to the canvas
		drawingSurface.fillStyle = "#000000";
		drawingSurface.shadowOffsetX = 1;
		drawingSurface.shadowOffsetY = 1;
		drawingSurface.shadowBlur = 2;
		drawingSurface.shadowColor="#FFFFFF";
		drawingSurface.font = "25px Verdana";
		drawingSurface.fillText("Score : " + score, 15, 25);
		drawingSurface.fillText("Highest Score : " + highestscore, 220, 25);
		drawingSurface.fillText("FPS : " + fps.getFPS(), 650, 25);
		if(paused){
			drawingSurface.font = "35px Verdana";
			drawingSurface.fillStyle = "#FFFFFF";
			drawingSurface.shadowOffsetX = 1;
			drawingSurface.shadowOffsetY = 1;
			drawingSurface.shadowBlur = 2;
			drawingSurface.shadowColor="#000000";
			drawingSurface.fillText("Paused!", (canvas.width / 2) - 72, canvas.height / 2);
			//Renders buttons to the canvas
			for(var i = 0; i < pausedButtons.length; i++){
				//Render the button
				drawingSurface.shadowOffsetX = 2;
				drawingSurface.shadowOffsetY = 2;
				drawingSurface.shadowBlur = 5;
				drawingSurface.shadowColor="#000000";
				
				var gradient = drawingSurface.createLinearGradient(0, 0, canvas.width, 0);
				gradient.addColorStop("0.5", "blue");
				gradient.addColorStop("1.0", "cyan");
				drawingSurface.fillStyle = gradient;
				drawingSurface.fillRect(pausedButtons[i].x, pausedButtons[i].y, 200,60);
				
				//Render the button's text
				drawingSurface.font = "25px Verdana";
				drawingSurface.fillStyle = "#FFFFFF";
				drawingSurface.fillText(pausedButtons[i].text, pausedButtons[i].x + pausedButtons[i].textOffsetX,  pausedButtons[i].y + pausedButtons[i].textOffsetY);
			}
		}
	}
	if(gameStarted == false && currentScreen == "mainMenu")
		mainMenu();
}

function mainMenu(){ // Render method for the main menu
	//Clears the screen
	drawingSurface.fillStyle = "white";
    drawingSurface.fillRect(0, 0, canvas.width, canvas.height);
	
	//Renders menu title to the canvas
	var gradient = drawingSurface.createLinearGradient(0, 0, canvas.width, 0);
	gradient.addColorStop("0", "blue");
	gradient.addColorStop("0.5", "magenta");
	gradient.addColorStop("1.0", "red");
	// Fill with gradient
	drawingSurface.shadowOffsetX = 5;
	drawingSurface.shadowOffsetY = 5;
	drawingSurface.shadowBlur = 5;
	drawingSurface.shadowColor="#FFBAF7";
	drawingSurface.font = "80px Verdana";
	drawingSurface.fillStyle = gradient;
	drawingSurface.fillText("Agar Io Singleplayer!", (canvas.width / 2) - 400, 150);

	//Renders buttons to the canvas
	for(var i = 0; i < menuButtons.length; i++){
		//Render the button
		drawingSurface.shadowOffsetX = 2;
		drawingSurface.shadowOffsetY = 2;
		drawingSurface.shadowBlur = 5;
		drawingSurface.shadowColor="#000000";
		
		gradient = drawingSurface.createLinearGradient(0, 0, canvas.width, 0);
		gradient.addColorStop("0.5", "blue");
		gradient.addColorStop("1.0", "cyan");
		drawingSurface.fillStyle = gradient;
		drawingSurface.fillRect(menuButtons[i].x, menuButtons[i].y, 200,60);
		
		//Render the button's text
		drawingSurface.font = "25px Verdana";
		drawingSurface.fillStyle = "#FFFFFF";
		drawingSurface.fillText(menuButtons[i].text, menuButtons[i].x + menuButtons[i].textOffsetX,  menuButtons[i].y + menuButtons[i].textOffsetY);
	}
}

var fps = {
	startTime : 0,
	frameNumber : 0,
	getFPS : function(){
		this.frameNumber++;
		var d = new Date().getTime(),
			currentTime = ( d - this.startTime ) / 1000,
			result = Math.floor( ( this.frameNumber / currentTime ) );

		if( currentTime > 1 ){
			this.startTime = new Date().getTime();
			this.frameNumber = 0;
		}
		return result;

	}	
};