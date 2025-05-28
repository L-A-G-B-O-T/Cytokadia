"use strict";

class Cell { //soft body
	constructor(nC, radius, start){
		this.cytoplasm = new StrictSoftBody(nC, radius, start, 1.3);
		
		this.body = new CompoundBody();
		this.body.offloadNodes(this.cytoplasm);
		this.body.offloadEdges(this.cytoplasm, this.body.distConstraints);
		this.body.referencedSoftBodies.push(this.cytoplasm);
		
		this.arms = [];
		for (let i = 0; i < 3; i++){
			const newArm = new SoftWormBody(6, 10, new Vector(0, 0));
			const connector = this.body.linkDC(this.cytoplasm, newArm, i, 0);
			connector.distance = 10;
			this.body.offloadEdges(newArm, this.body.distConstraints);
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
		//circular body
		ctx.fillStyle = "yellow";
		ctx.strokeStyle = "pink";
		ctx.lineWidth = 10;
		
		const startPoint = this.cytoplasm.nodes[0];
		
		ctx.beginPath();
		ctx.moveTo(startPoint.x, startPoint.y);
		for (let i = 1; i < this.cytoplasm.nodes.length+3; i++){
			const node = this.cytoplasm.nodes[i % this.cytoplasm.nodes.length];
			ctx.lineTo(node.pos.x, node.pos.y);
		}
		ctx.fill();
		ctx.stroke();
		ctx.closePath();

		//arms
		

		/*
		for (const edge of this.body.distConstraints){
			ctx.beginPath();
			const p1 = edge.A.pos.toArray();
			const p2 = edge.B.pos.toArray();
			
			ctx.moveTo(p1[0], p1[1]);
			ctx.lineTo(p2[0], p2[1]);
			
			ctx.strokeStyle = "white";
			ctx.stroke();
			ctx.closePath();
		}
		ctx.closePath();
		for (const node of this.body.nodes){
			ctx.beginPath();
			ctx.ellipse(node.pos.x, node.pos.y, 3, 3, 0, 0, Math.PI * 2);
			ctx.strokeStyle = "white";
			ctx.stroke();
			ctx.closePath();
		}
		*/
	}
}