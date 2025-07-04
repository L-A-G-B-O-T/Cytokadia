"use strict";

var bacteria = [];
var cells = [];
var deltaTime = 30;
var timeLast = new Date().getTime();
var mouse = {
	pos : new Vector(0, 0),
	pressLeft : false, 
};

canvas.onmousemove = function(e){
	mouse.pos.set(e.offsetX * canvasScaleFactor, e.offsetY * canvasScaleFactor);
};
canvas.onmousedown = function(e){
	mouse.pressLeft = true;
};
canvas.onmouseup = function(e){
	mouse.pressLeft = false;
};

function mainloop(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (const bacterium of bacteria) bacterium.tick(timeLast);
	for (const cell of cells) cell.tick(timeLast);

	
    for (const bacterium of bacteria) bacterium.draw();
	for (const cell of cells) cell.draw();
	
	const timeCurrent = new Date().getTime();
	ctx.fillStyle = "white";
	ctx.fillText(`deltaTime: ${timeCurrent - timeLast}`,10,10);
	//console.log(timeCurrent - timeLast);
	timeLast = timeCurrent;
	
}

function initialize(){
	console.log("init");
    bacteria.push(new Bacterium(10, 5, new Vector(200,200)));
	bacteria[0].AI.isPlayer = true;
	for (let i = 0; i < 3; i++){ 
		cells.push(new Ameboid(15, 100, new Vector(210*(i+1),500)));
		cells[i].AI.targetObj = bacteria[0];
	}
	
	setInterval(mainloop, deltaTime);
}

var running = false;
canvas.onclick = function(e){
	if (running) return;
	running = true;
	initialize();
};