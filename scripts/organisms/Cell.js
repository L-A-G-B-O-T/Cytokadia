class Cell { //pressure soft body
	constructor(nC, radius, start){
		this.body = new PressureSoftBody(nC, radius, start);
		this.AI = {
			targetDir : new Vector(0, 0),
			targetObj : null,
		}
	}
	tick(t){
		
		this.body.tick(deltaTime);
	}
	draw(){
		
		for (const edge of this.body.edges){
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
			const posArr = node.pos.toArray();
			ctx.ellipse(posArr[0], posArr[1], 3, 3, 0, 0, Math.PI * 2);
			ctx.strokeStyle = "white";
			ctx.stroke();
			ctx.closePath();
		}
	}
}