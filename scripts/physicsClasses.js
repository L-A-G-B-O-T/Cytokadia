"use strict";

class Node {
	static xposGreater(a, b){
		return a.pos.x - b.pos.x;
	}
	constructor(){
		this.pos = new Vector(0, 0); //will be in pixels
		this.nextPosAcc = []; //accumulator for all positions
		this.posPrev = new Vector(0, 0); //stores the previous position for Verlet Integration
		this.force = new Vector(0, 0);//mcg * pixel/millisecond^2
		this.mass = 1;//imaginary mass unit
	}
	physicsTick(t, damping){ //deltaTime will be in milliseconds
		
		if (this.nextPosAcc.length > 0){
			let averageNewPos = this.nextPosAcc[0];
			for (let i = 1; i < this.nextPosAcc.length; i++){
				averageNewPos.addSelf(this.nextPosAcc[i]);
			}
			averageNewPos.divScalarSelf(this.nextPosAcc.length);
			
			this.pos.copy(averageNewPos);
			this.nextPosAcc.length = 0;
		}
		
		const vel = this.pos.sub(this.posPrev);
		vel.addSelf(this.force.divScalar(this.mass));
		vel.clampSelf(minLimit, maxLimit);
		this.force.set(0, 0);

		vel.mulScalarSelf(damping); // damping factor
		
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
	collideWithNode(otherNode, minDistance){
		const otherPos = otherNode.pos;
		const displacement = otherPos.sub(this.pos);
		if (displacement.length() < minDistance){
			const moveDist = (minDistance - displacement.length())/2 //positive value, would be applied to this node
			
			const moveDisp = displacement.normalize().mulScalarSelf(-moveDist);
			this.nextPosAcc.push(this.pos.add(moveDisp));
			otherNode.nextPosAcc.push(otherPos.sub(moveDisp));
		}
	}
	collideWithPolygon(pointList){
		
	}
}
/*
class SpringEdge {
	constructor(){
		this.A = this.B = null; //contains references to Nodes
		this.stiffness = 0.5;
		this.restLength = 100;
		this.damping = 0;
	}
	calcForce(){ //returns amount of pulling force of the spring. Pushing force is negative. 
		if (!(this.A instanceof Node && this.B instanceof Node)){
            throw TypeError("A or B of <SpringEdge> object is not of type <Node>");
        }
        const currentLength = this.A.pos.sub(this.B.pos).length();
		let force = this.stiffness * (currentLength - this.restLength);
		const AToBDir = this.B.pos.sub(this.A.pos).normalizeSelf();
		if (AToBDir.length() == 0){
			console.log("catch clip");
			AToBDir.set(1, 0);
		}

		//damping force

		this.A.force.addSelf(AToBDir.mulScalar(force));
		this.B.force.addSelf(AToBDir.mulScalar(-force));
		return force;
	}
}
*/
class DistanceConstraint {
	constructor(){
		this.A = this.B = null;
		this.distance = 100; //default
	}
    constrain(){//sets the position of this.B so it lies in the distance constraint
        if (!(this.A instanceof Node && this.B instanceof Node)){
            throw TypeError("A or B of <DistanceConstraint> object is not of type <Node>");
        }
		const disp = this.B.pos.sub(this.A.pos);
		disp.normalizeSelf();
		disp.normalizeSelf().mulScalarSelf(this.distance);
		this.B.pos.copy(this.A.pos.add(disp));
    }
}

class DistanceConstraint_Bi {
	constructor(){
		this.A = this.B = null;
		this.distance = 100;
	}
	constrain(){ //makes the position of this.A and this.B approach each other
		if (!(this.A instanceof Node && this.B instanceof Node)){
            throw TypeError("A or B of <DistanceConstraint> object is not of type <Node>");
        }
		const disp = this.B.pos.sub(this.A.pos);
		const dist = disp.length();
		const correctionAmount = (this.distance - dist) / 2;
		
		disp.normalizeSelf().mulScalarSelf(correctionAmount);
		this.A.nextPosAcc.push(this.A.pos.sub(disp));
		this.B.nextPosAcc.push(this.B.pos.add(disp));
	}
}

class AngleConstraint {
	constructor(){
		this.A = this.B = this.C = null;
		this.minAngle = Math.PI / 2; //90 degrees
		this.maxAngle = 3*Math.PI / 2; //no max angle
	}
	constrain(){ //sets the position of nodes so their angle is above a threshold
		if (this.minAngle < 0 || this.maxAngle > 2*Math.PI)
			throw RangeError("AngleConstraint.minAngle or maxangle are too small (min < 0) or too big (max > 2pi)");
		else if (this.maxAngle < this.minAngle)
			throw RangeError("AngleConstraint.maxAngle is less than minAngle");
		
		let toA = this.A.pos.sub(this.B.pos);
		let toC = this.C.pos.sub(this.B.pos);
		
		//get smaller angle
		let ang = (toA.toRadians() - toC.toRadians());
		ang = (ang + Math.PI*2) % (Math.PI*2)
		
		ctx.strokeStyle = "white";
		
		if (Math.abs(ang) < this.minAngle){
			ctx.strokeStyle = "red";
			
			const unitAng = ang / Math.abs(ang);
			toA.rotateRadiansSelf(unitAng*(this.minAngle- Math.abs(ang))/2);
			toC.rotateRadiansSelf(-unitAng*(this.minAngle-Math.abs(ang))/2);
			this.A.nextPosAcc.push(toA.add(this.B.pos));
			this.C.nextPosAcc.push(toC.add(this.B.pos));
		}
		else if (Math.abs(ang) > this.maxAngle){
			ctx.strokeStyle = "red";
			
			const unitAng = ang / Math.abs(ang);
			toA.rotateRadiansSelf(unitAng*(this.maxAngle-Math.abs(ang))/2);
			toC.rotateRadiansSelf(-unitAng*(this.maxAngle-Math.abs(ang))/2);
			this.A.nextPosAcc.push(toA.add(this.B.pos));
			this.C.nextPosAcc.push(toC.add(this.B.pos));
		}
		
		if (false){
		ctx.strokeCircle(this.B.pos, 10, toC.toRadians(), toC.toRadians() + ang);
		
		ctx.strokeCircle(new Vector(100, 100), 40, 0, toA.toRadians());
		ctx.strokeStyle = "blue";
		ctx.strokeCircle(new Vector(100, 100), 36, 0, toC.toRadians());
		ctx.strokeStyle = "green";
		ctx.strokeCircle(new Vector(100, 100), 32, toC.toRadians(), toC.toRadians() + ang);
		
		ctx.fillText(`${ang}`, 100, 100);
		}
	}
}

class AngleConstraint_OneWay {
    constructor(){
        this.A = this.B = this.C = null;
        this.minAngle = Math.PI / 2;
        this.maxAngle = 3*Math.PI / 2;
    }
    constrain(){
        if (this.minAngle < 0 || this.maxAngle > 2*Math.PI)
			throw RangeError("AngleConstraint.minAngle or maxangle are too small (min < 0) or too big (max > 2pi)");
		else if (this.maxAngle < this.minAngle)
			throw RangeError("AngleConstraint.maxAngle is less than minAngle");
		
		let toA = this.A.pos.sub(this.B.pos);
		let toC = this.C.pos.sub(this.B.pos);
		
		//get smaller angle
		let ang = (toA.toRadians() - toC.toRadians());
		ang = (ang + Math.PI*2) % (Math.PI*2)
		
		ctx.strokeStyle = "white";
		
		if (Math.abs(ang) < this.minAngle){
			ctx.strokeStyle = "red";
			
			const unitAng = ang / Math.abs(ang);
			toC.rotateRadiansSelf(-unitAng*(this.minAngle-Math.abs(ang)));
			this.C.nextPosAcc.push(toC.add(this.B.pos)); //change to this.C.copy?
		}
		else if (Math.abs(ang) > this.maxAngle){
			ctx.strokeStyle = "red";
			
			const unitAng = ang / Math.abs(ang);
			toC.rotateRadiansSelf(-unitAng*(this.maxAngle-Math.abs(ang)));
			this.C.nextPosAcc.push(toC.add(this.B.pos));
		}
    }
}