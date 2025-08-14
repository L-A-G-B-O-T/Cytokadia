"use strict";

class Cell { //soft body
	constructor(nC, radius, start){
		this.cytoplasm = new StrictSoftBody(nC, radius, start, 1.0);
		
		this.body = new CompoundBody();
		this.body.offloadNodes(this.cytoplasm);
		this.body.offloadEdges(this.cytoplasm, this.body.distConstraints);
		this.body.referencedSoftBodies.push(this.cytoplasm);

		this.cytoplasmHue = 60;
		this.borderSaturation = 0;
	}
	tick(t){
		this.body.tick(t);
	}
	draw(){
		ctx.save();
		{//circular body
			ctx.fillStyle = `hsla(${this.cytoplasmHue}, 100%, 50%, 0.5)`;
			ctx.strokeStyle = `hsla(${this.cytoplasmHue}, 100%, ${50 + this.borderSaturation*50}%, 1.0)`;
			ctx.lineWidth = 10;
			
			let curve = [];

			this.cytoplasm.nodes.forEach(node => {
				curve.push(node.pos.x, node.pos.y);
			});
			ctx.beginPath();
			ctx.curve(curve, 0.5, 5, true);

			ctx.fill();
			ctx.closePath();
			ctx.stroke();
		}
		ctx.restore();
	}
}

class Ameboid extends Cell{ //move via pseudopods
	constructor(nC, radius, start){
		super(nC, radius, start);

		this.AI = {
			targetLoc : new Vector(0, 0), //location that the cell wants to move towards
			targetObj : null, //object that the cell is interested in
			pseudopods : Array(nC),
			stepTimer : new Date().getTime() + Math.random()*2000,
			pseudopodProportion : 0.25,
			moveSpeed : 0.25,
		}
		this.newPseudoPods(this.AI.pseudopodProportion);
	}
	tick(t){
		if (t == undefined)
			throw TypeError("Ameboid().tick(t) has t == undefined");

		if (this.AI.stepTimer < new Date().getTime()){
			this.updateTargetLoc();
			this.AI.stepTimer = new Date().getTime() + Math.random()*2000;
			this.newPseudoPods(this.AI.pseudopodProportion);
		}
		for (let i = 0; i < this.cytoplasm.nC; i++){
			if (!this.AI.pseudopods[i]) continue;
			const pseudopod = this.cytoplasm.nodes[i];
			const targetDir = this.AI.targetLoc.sub(pseudopod.pos).normalizeSelf();
			pseudopod.force.addSelf(targetDir.mulScalarSelf(this.AI.moveSpeed / this.AI.pseudopodProportion));
		}
		super.tick(t);
	}
	newPseudoPods(proportion){
		const newIndexes = randomIntegerArray(this.cytoplasm.nC).slice(0, this.cytoplasm.nC * proportion);
		this.AI.pseudopods.fill(false);
		for (const i of newIndexes)
			this.AI.pseudopods[i] = true;
	}
	updateTargetLoc(){
		if (this.AI.targetObj == null)
			return;
		this.AI.targetLoc = this.AI.targetObj.pos.clone();
	}
}

class DevourerCell extends Ameboid { //reach over to you with pseudopods and pull you in, digesting you. 
	constructor(start){
		super(20, 200, start);
		this.cytoplasmHue = 60;
		this.borderSaturation = 0;
	}
	tick(t){
		//search around itself for bacteria
			//upon finding bacteria, lock on to one of its body nodes (head probably)
			//AI.targetObj = body node
		//search around itself for debris
			
		super.tick(t);
	}
	updateTargetLoc(){
		if (this.AI.targetObj == null)
			return;
		this.AI.targetLoc.copy(this.AI.targetObj.pos);
	}
}

class SpitterCell extends Ameboid { //build up pressure and spit granules. Like to quickly explode if you get too close, releasing nets. 
	constructor(start){
		super(15, 125, start);
		this.cytoplasmHue = 120;
		this.borderSaturation = 0;
		this.AI.spitDist = 350;
		this.AI.fullArea = this.cytoplasm.idealArea;
		this.AI.closeEnough = false;
		this.cytoplasm.idealArea /= 2;
	}
	tick(t){
		//build up pressure if not full (increase cytoplasm.idealArea or cytoplasm.pressureStiffness gradually)
		if (this.cytoplasm.idealArea < this.AI.fullArea)
			this.cytoplasm.idealArea += 100;
		//search around itself for bacteria
		//upon finding bacteria, lock on to one of its body nodes (head probably)
		//if AI.targetObj is not null
		//if targetObj is close enough AND pressure is full
			//launch granules at bacteria from nodes closest to bacteria
		if (this.AI.targetObj != null){
			if (this.AI.closeEnough && this.cytoplasm.idealArea >= this.AI.fullArea){
				//recoil
				this.cytoplasm.idealArea /= 2;
				//find node(s) closest to targetObj
				const closestNodeIndex = findClosestNodeInLoop(this.AI.targetObj, this.cytoplasm.nodes);
				//obtain a (not necessarily ordered) list of indexes for the closest quarter of nodes
				const secretion = Math.floor(this.cytoplasm.nC / 8);
				let nodesForRecoil = [closestNodeIndex];
				for (let i = 1; i <= secretion; i++){
					nodesForRecoil.push(closestNodeIndex - i);
					nodesForRecoil.push((closestNodeIndex + i) % this.cytoplasm.nC);
				}
				

				for (let i = 0; i < this.cytoplasm.nC; i++){
					const node = this.cytoplasm.nodes[i];
					
					const recoil = node.pos.sub(this.AI.targetObj.pos).normalizeSelf().mulScalarSelf(5);
					if (nodesForRecoil.includes(i)){
						const granule = new Granule(node.pos);
						granule.node.force.subSelf(recoil);
						materials.push(granule);
						recoil.mulScalarSelf(2);
					}
					node.force.addSelf(recoil);
				}
			}
		}
			
		
		super.tick(t);
	}
	updateTargetLoc(){
		//chose a point in between itself and AI.targetObj.pos
		if (this.AI.targetObj == null)
			return;
		const randIndex = Math.floor(this.cytoplasm.nC * Math.random());
		const selfPoint = this.cytoplasm.nodes[randIndex].pos;
		const displacement = this.AI.targetObj.pos.sub(selfPoint)
		const targetDir = displacement.normalize(); //direction from selfPoint to targetLoc
		this.AI.targetLoc.copy(this.AI.targetObj.pos.sub(targetDir.mulScalarSelf(this.AI.spitDist)));
		this.AI.closeEnough = displacement.length() < this.AI.spitDist;
	}
}

class MessengerCell extends Ameboid { //activates Factory cells and Alarm cells
	constructor(start){
		super(20, 125, start);
		this.cytoplasmHue = 120;
		this.borderSaturation = 0;
	}
}

class AlarmCell extends Ameboid { //have a higher aggro radius, and alerts + boosts other immune cells
	constructor(start){
		super(10, 75, start);
		this.cytoplasmHue = 180;
		this.borderSaturation = 0;
	}
}

class FactoryCell extends Ameboid { //Produces bio weapons
	constructor(start){
		super(10, 90, start); //start off 90 radius, swell to 180 radius when activated
		this.cytoplasmHue = 300;
		this.borderSaturation = 0;
	}
}

class LoungerCell extends Cell { //Unmoving cell / movement determined by surrounding environment, cosmetic
	constructor(nC, radius, start){
		super(nC, radius, start);
		this.cytoplasmHue = 0;
		this.borderSaturation = 0.5;
	}
}