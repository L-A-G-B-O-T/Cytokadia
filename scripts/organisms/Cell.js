"use strict";

class Cell { //soft body
	constructor(nC, radius, start){
		this.cytoplasm = new StrictSoftBody(nC, radius, start, 1.0);
		
		this.body = new CompoundBody();
		this.body.offloadNodes(this.cytoplasm);
		this.body.offloadEdges(this.cytoplasm, this.body.distConstraints);
		this.body.referencedSoftBodies.push(this.cytoplasm);
		
		this.AI = {
			targetLoc : new Vector(0, 0),
			targetObj : null,
		}
	}
	tick(t){
		this.body.tick(t);
	}
	draw(){
		ctx.save();
		{//circular body
			ctx.fillStyle = "rgba(255, 255, 0.0, 0.5)";
			ctx.strokeStyle = "white";
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
		this.AI.pseudopods = Array(nC); //stores pseudopod / not pseudopox
		this.AI.stepTimer = new Date().getTime() + Math.random()*2000;
		this.AI.pseudopodProportion = 0.25;
		this.AI.moveSpeed = 0.25;
		this.newPseudoPods(this.AI.pseudopodProportion);
	}
	tick(t){
		if (t == undefined)
			throw TypeError("Ameboid().tick(t) has t == undefined");
		if (this.AI.targetObj != null && this.AI.stepTimer < new Date().getTime()){
			this.AI.targetLoc = this.AI.targetObj.body.nodes[0].pos.clone();
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
	draw(){
		ctx.save();
		{//circular body
			ctx.fillStyle = "rgba(255, 255, 0.0, 0.5)";
			ctx.strokeStyle = "white";
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

class Devourer extends Ameboid { //reach over to you with pseudopods and pull you in, digesting you. 

}

class Spitter extends Ameboid { //build up pressure and spit granules. Like to quickly explode if you get too close, releasing nets. 

}

class Alarm extends Ameboid { //have a higher aggro radius, and alerts + boosts other immune cells

}

class Messenger extends Ameboid { //activates Factory cells

}

class Factory extends Ameboid { //Produces bio weapons

}

class Lounger extends Ameboid { //Unmoving cell / movement determined by surrounding environment, cosmetic

}