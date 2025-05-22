"use strict";

class Cell { //pressure soft body
	constructor(nC, radius, start){
		this.cytoplasm = new PressureSoftBody(nC, radius, start);
		
		this.body = new CompoundBody();
		this.body.offloadNodes(this.cytoplasm);
		this.body.offloadEdges(this.cytoplasm, this.body.springs);
		this.body.offloadAngles(this.cytoplasm);

		this.AI = {
			targetDir : new Vector(0, 0),
			targetObj : null,
		}
	}
	tick(t){
		if (this.AI.targetObj != null && Math.random() > 0.95){
			this.AI.targetDir = this.AI.targetObj.body.nodes[0].pos.sub(this.body.nodes[0].pos).normalizeSelf();
			console.log("ture");
		}
		this.body.nodes.forEach(node => node.force.addSelf(this.AI.targetDir.mulScalar(Math.random()*4)));
		this.body.tick(t);
	}
	draw(){
		
		for (const edge of this.body.springs){
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
	}
}