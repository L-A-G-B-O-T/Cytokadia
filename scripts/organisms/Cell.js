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
		this.AI.pseudopods = Array(nC); //stores if each node is acting as a pseudopod
		this.AI.stepTimer = new Date().getTime() + Math.random()*2000;
		for (let i = 0; i < nC; i++){
			this.AI.pseudopods[i] = (i % 4 != 0);
		}
	}
	tick(t){
		if (this.AI.targetObj != null && this.AI.stepTimer < new Date().getTime()){
			this.AI.targetLoc = this.AI.targetObj.body.nodes[0].pos.clone();
			this.AI.stepTimer = new Date().getTime() + Math.random()*2000;

		}
		for (let i = 0; i < this.cytoplasm.nC; i++){
			if (!this.AI.pseudopods[i]) continue;
			const pseudopod = this.cytoplasm.nodes[i];
			const targetDir = this.AI.targetLoc.sub(pseudopod.pos).normalizeSelf();
			pseudopod.force.addSelf(targetDir);
		}
		super.tick(t);
	}
	
}