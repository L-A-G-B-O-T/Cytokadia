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