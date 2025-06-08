"use strict";

class Cell { //soft body
	constructor(nC, radius, start){
		this.cytoplasm = new StrictSoftBody(nC, radius, start, 1.0);
		
		this.body = new CompoundBody();
		this.body.offloadNodes(this.cytoplasm);
		this.body.offloadEdges(this.cytoplasm, this.body.distConstraints);
		this.body.referencedSoftBodies.push(this.cytoplasm);
		
		this.arms = [];
		for (let i = 0; i < nC; i++){
			if (i % 5 != 0){
				this.arms.push(null);
				continue;
			}
			const newArm = new SoftWormBody(6, 30, new Vector(0, 0));
			const connector = this.body.linkDC(this.cytoplasm, newArm, i, 0);
			connector.distance = 30;
			this.body.offloadEdges(newArm, this.body.distConstraints);
			this.arms.push(newArm);
		}

		this.AI = {
			targetDir : new Vector(0, 0),
			targetObj : null,
		}
	}
	tick(t){
		if (this.AI.targetObj != null && Math.random() > 0.95){
			this.AI.targetDir = this.AI.targetObj.body.nodes[0].pos.sub(this.body.nodes[0].pos).normalizeSelf();
		}
		this.cytoplasm.nodes.forEach(node => node.force.addSelf(this.AI.targetDir));
		this.body.tick(t);
	}
	draw(){
		
		
		{//circular body
			ctx.fillStyle = "yellow";
			ctx.strokeStyle = "white";
			ctx.lineWidth = 10;
			const startPoint = this.cytoplasm.nodes[0];
			
			ctx.beginPath();
			ctx.moveTo(startPoint.pos.x, startPoint.pos.y);
			for (let i = 1; i < this.cytoplasm.nodes.length+1; i++){
				const node = this.cytoplasm.nodes[i % this.cytoplasm.nodes.length];
				ctx.lineTo(node.pos.x, node.pos.y);
			}
			ctx.fill();
			ctx.closePath();
			ctx.stroke();
		}
		
		for (let i = 0; i < this.cytoplasm.nodes.length; i++){//arms
			const arm = this.arms[i];
			if (arm == null) continue;

			ctx.strokeStyle = "white";
			ctx.lineWidth = 10;
			

			const startPoint = this.cytoplasm.nodes[i];
			
			ctx.beginPath();
			ctx.moveTo(startPoint.pos.x, startPoint.pos.y);
			arm.nodes.forEach(node => {
				ctx.lineTo(node.pos.x, node.pos.y);
			});
			ctx.stroke();
		};
		
	}
}