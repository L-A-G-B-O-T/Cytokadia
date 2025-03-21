"use strict";

const canvas = document.getElementById("mainCanvas");

//This game will try to fit whatever window, so I will need to center my ctx drawings accordingly
canvas.height = 620;
canvas.width = 620 * (window.innerWidth - 20) / (window.innerHeight - 20);

const ctx = canvas.getContext("2d");

ctx.fillStyle = "white";
ctx.fillRegularPolygon = function(centerX, centerY, radius, rotation, sides){
	let dir = rotation - Math.PI * 2 / sides;
	ctx.moveTo(centerX + Math.cos(dir)*radius, centerY + Math.sin(dir)*radius);
	ctx.beginPath();
	for (let dir = rotation; dir < rotation + Math.PI * 2; dir += Math.PI * 2 / sides){
		ctx.lineTo(centerX + Math.cos(dir)*radius, centerY + Math.sin(dir)*radius);
	}
	ctx.fill();
	ctx.closePath();
};

ctx.fillRegularPolygon(canvas.width / 2, canvas.height / 2, 100, 0, 3);

class Node {
	constructor(){
		this.pos = new Vector(0, 0);
		this.vel = new Vector(0, 0); //ignore maybe due to small enviroment?
		this.force = new Vector(0, 0);
		this.mass = 1;
	}
}

class SpringEdge {
	constructor(){
		this.A = this.B = null; //contains references to Nodes
		this.stiffness = 1;
		this.restLength = 100;
		this.damping = 0;
	}
	calcForce(){ //returns amount of pulling force of the spring. Pushing force is negative. 
		if (typeof this.A != Node || typeof this.B != Node){
            throw TypeError("A or B of <SpringEdge> object is not of type <Node>");
        }
        const currentLength = this.A.pos.sub(this.B.pos).length();
		return this.stiffness * (currentLength - this.restingLength);
	}
}

class DistanceConstraint {
	constructor(){
		this.A = this.B = null;
		this.distance = 100; //default
	}
    constrain(){
        if (typeof this.A != Node || typeof this.B != Node){
            throw TypeError("A or B of <SpringEdge> object is not of type <Node>");
        }
        const disp = this.B.pos.sub(this.A.pos);
        disp.normalizeSelf();
        this.B.pos.copy(this.A.pos.add(disp));
    }
}

class Cell { //pressure soft body
	
}

class Bacterium {
	constructor(){
		
	}
	player(){
		
	}
	tick(){
		
	}
	draw(){
		
	}
}
var bacteria = [];

function mainloop(){
	for (const bacterium of bacteria) bacterium.tick();
    for (const bacterium of bacteria) bacterium.draw();
}

function initialize(){
    bacteria.push(new Bacterium());
	setInterval(mainloop, 50);
}

var running = false;
canvas.onclick = function(e){
	if (running) return;
	running = true;
	initialize();
};