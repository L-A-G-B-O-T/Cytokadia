"use strict";

var bacteria = [];
var cells = [];
var materials = [];
var deltaTime = 30;
var timeLast = new Date().getTime();
var mouse = {
	pos : new Vector(0, 0),
	screenPos : new Vector(0, 0),
	pressLeft : false, 
};

canvas.onmousemove = function(e){
	mouse.screenPos.set(e.offsetX * canvasScaleFactor, e.offsetY * canvasScaleFactor);
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
	for (const material of materials) material.tick(timeLast);
	
	{
		let savedMaterial = [];
		materials.forEach(m => {if (m.lifeLeft > 0) savedMaterial.push(m)});
		materials = savedMaterial;
	}


	Camera.update();
	Camera.drawMesh(50);
    for (const bacterium of bacteria) Camera.drawBacterium(bacterium);
	for (const cell of cells) Camera.drawCell(cell);
	for (const material of materials) Camera.drawMaterial(material);

	const timeCurrent = new Date().getTime();
	ctx.fillStyle = "white";
	ctx.fillText(`deltaTime: ${timeCurrent - timeLast}`,10,10);
	//console.log(timeCurrent - timeLast);
	timeLast = timeCurrent;
	
}

function initialize(){
	console.log("init");
    bacteria.push(new Bacterium(10, 5, new Vector(0,0)));
	bacteria[0].AI.isPlayer = true;
	Camera.targetObj = bacteria[0].head;
	
	cells.push(new DevourerCell(new Vector(-500,0)));
	cells[0].AI.targetObj = bacteria[0].head;
	cells.push(new SpitterCell(new Vector(500,0)));
	cells[1].AI.targetObj = bacteria[0].head;

	materials.push(new Granule(new Vector(100, 100)));
	
	setInterval(mainloop, deltaTime);
}

var running = false;
canvas.onclick = function(e){
	if (running) return;
	running = true;
	initialize();
};