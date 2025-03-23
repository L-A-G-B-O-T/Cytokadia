"use strict";

const canvas = document.getElementById("mainCanvas");

//This game will try to fit whatever window, so I will need to center my ctx drawings accordingly
canvas.height = 620;
canvas.width = 620 * (window.innerWidth - 20) / (window.innerHeight - 20);
const canvasScaleFactor = canvas.height/(window.innerHeight - 20);

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
		this.pos = new Vector(0, 0); //will be in pixels
		this.posPrev = new Vector(0, 0); //stores the previous position for Verlet Integration
		this.force = new Vector(0, 0);//mcg * pixel/millisecond^2
		this.mass = 1;//mcg
	}
	physicsTick(deltaTime){ //deltaTime will be in milliseconds
		this.force.set(0, 0);
		//add all forces onto it

		const vel = this.pos.sub(this.posPrev);
		vel.addSelf(this.force.divScalar(this.mass));
		
		vel.mulScalarSelf(0.95) // damping factor;

		const posNext = this.pos.add(vel);
		this.posPrev.copy(this.pos);
		this.pos.copy(posNext);
		//this.pos next = this.pos + (this.pos - this.posPrev + this.force/this.mass)

		this.stayInBound(0, 0, canvas.width, canvas.height); //optional
		


	}
	stayInBound(minX, minY, maxX, maxY){
		const posArr = this.pos.toArray();
		const vel = this.pos.sub(this.posPrev);
		if (posArr[0] < minX){ //reverse X velocity in Verlet
			vel.copyX(vel.invert());
			this.pos.set(minX, undefined);
			this.posPrev.copy(this.pos.sub(vel));
		} if (posArr[1] < minY){
			vel.copyY(vel.invert());
			this.pos.set(undefined, minY);
			this.posPrev.copy(this.pos.sub(vel));
		} if (posArr[0] > maxX){
			vel.copyX(vel.invert());
			this.pos.set(maxX, undefined);
			this.posPrev.copy(this.pos.sub(vel));
		} if (posArr[1] > maxY){
			vel.copyY(vel.invert());
			this.pos.set(undefined, maxY);
			this.posPrev.copy(this.pos.sub(vel));
		}
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
		if (!(this.A instanceof Node && this.B instanceof Node)){
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
    constrain(){ //sets the position of nodes so they lie in the distance constraint
        if (!(this.A instanceof Node && this.B instanceof Node)){
            throw TypeError("A or B of <SpringEdge> object is not of type <Node>");
        }
		const midPos = this.A.pos.add(this.B.pos).divScalarSelf(2);
		const AToMidDir = midPos.sub(this.A.pos).normalizeSelf();
		if (AToMidDir.length() == 0){
			console.log("catch clip");
			AToMidDir.set(1, 0);
		}
		this.B.pos.copy(midPos.add(AToMidDir.mulScalar(this.distance/2)));
		this.A.pos.copy(midPos.add(AToMidDir.mulScalar(-this.distance/2)));
    }
}

class AngleConstraint {
	constructor(){
		this.A = this.B = this.C = null;
		this.minAngle = Math.PI / 2; //90 degrees
		this.maxAngle = undefined; //no max angle
	}
	constrain(){ //sets the position of nodes so their angle is above a threshold
		if (this.minAngle < 0 || this.maxAngle > Math.PI)
			throw RangeError("AngleConstraint.minAngle or maxangle are too small (min < 0) or too big (max > pi)");
		else if (this.maxAngle < this.minAngle)
			throw RangeError("AngleConstraint.maxAngle is less than minAngle");
		let toA = this.A.pos.sub(this.B.pos);
		let toC = this.C.pos.sub(this.B.pos);
		let ang = toA.toRadians() - toC.toRadians(); //get smaller angle
		if (ang > Math.PI) ang -= Math.PI * 2;
		if (ang < -Math.PI) ang += Math.PI * 2;
		if (Math.abs(ang) < this.minAngle){
			const unitAng = ang / Math.abs(ang);
			toA.rotateRadiansSelf(-unitAng*(this.minAngle-ang)/2);
			toC.rotateRadiansSelf(unitAng*(this.minAngle-ang)/2);
			this.A.pos.copy(this.B.pos.add(toA));
			this.C.pos.copy(this.B.pos.add(toC));
		}
	}
}

class HardWormBody { //DistanceConstraint(Node, Node) in a line
	constructor(nodeCount, internodeLength, headPos){
		if (!(headPos instanceof Vector))
			throw TypeError(`headPos of HardWormBody should be <Vector>, not <${headPos.constructor.name}>`);
		this.nodes = [];
		this.edges = [];
		this.angles = [];
		for (let i = 0; i < nodeCount; i++){
			const newNode = new Node();
			newNode.pos.copy(headPos.addScalar(i*10));
			newNode.posPrev = newNode.pos;
			this.nodes.push(newNode);
		}
		for (let i = 1; i < nodeCount; i++){
			const newEdge = new DistanceConstraint();
			newEdge.A = this.nodes[i - 1];
			newEdge.B = this.nodes[i];
			newEdge.distance = internodeLength;
			this.edges.push(newEdge);
		}
		for (let i = 1; i < nodeCount - 1; i++){
			const newAngle = new AngleConstraint();
			newAngle.A = this.nodes[i - 1];
			newAngle.B = this.nodes[i];
			newAngle.C = this.nodes[i + 1];
			newAngle.minAngle = Math.PI / 2;
			this.angles.push(newAngle);
		}
	}
	tick(deltaTime){
		for (const edge of this.edges){
			edge.constrain();
		}
		for (const angle of this.angles){
			angle.constrain();
		}
		for (const node of this.nodes){
			node.physicsTick(deltaTime);
		}
		if (mouse.pressLeft)
			this.nodes[0].pos.copy(mouse.pos);
	}
}

class SoftWormBody { //SpringEdge(Node, Node) in a line

}

class PressureSoftBody { //SpringEdge(Node, Node) in a loop

}

class Cell { //pressure soft body
	
}

class Bacterium { //
	constructor(){
		this.body = new HardWormBody(10, 20, new Vector(100, 100));
	}
	player(){
		
	}
	tick(deltaTime){
		this.body.tick(deltaTime);
	}
	draw(){
		for (const node of this.body.nodes){
			ctx.beginPath();
			const posArr = node.pos.toArray();
			ctx.ellipse(posArr[0], posArr[1], 3, 3, 0, 0, Math.PI * 2);
			ctx.strokeStyle = "white";
			ctx.stroke();
			ctx.closePath();
		}
	}
}
var bacteria = [];
var deltaTime = 50;
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
	for (const bacterium of bacteria) bacterium.tick(deltaTime);

	ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const bacterium of bacteria) bacterium.draw();
}

function initialize(){
	console.log("init");
    bacteria.push(new Bacterium());
	setInterval(mainloop, deltaTime);
}

var running = false;
canvas.onclick = function(e){
	if (running) return;
	running = true;
	initialize();
};