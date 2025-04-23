class Bacterium { //
	constructor(nC, cNC, start){
		this.nodeCount = nC;
		this.cytoplasmNodeCount = cNC;
		//this.flagellumNodeCount = this.nodeCount - this.cytoplasmNodeCount
		
		this.body = new HardWormBody(this.nodeCount, 10, start);
		this.head = this.body.nodes[0];
		for (let i = 0; i < this.cytoplasmNodeCount; i++)
			this.body.nodes[i].mass = 10;
		
		this.thicknessAt = Array(this.nodeCount);
		for (let i = 0; i < this.nodeCount; i++)
			if (i < this.cytoplasmNodeCount) this.thicknessAt[i] = 10; else this.thicknessAt[i] = 2;
		
		//use for parametric equations
		this.bodyPoints = []; 
		let i = 0;
		for (; i < this.cytoplasmNodeCount*2+6; i++) this.bodyPoints.push(new Vector(0, 0));
		this.calcParametric();
		
		this.AI = {
			isPlayer : false,
			targetDir : new Vector(0, 0),
		}
	}
	calcParametric(){
		let i = 0;
		for (; i < this.cytoplasmNodeCount; i++){ //start with the side of the head -> side of tail
			const p1 = this.body.nodes[i];
			const p2 = this.body.nodes[i+1];
			
			const normalVec = p1.pos.sub(p2.pos).normalizeSelf().rotateRadiansSelf(Math.PI/2).mulScalarSelf(this.thicknessAt[i]); //angle to next Node... if last node return previous value
			this.bodyPoints[i].copy(normalVec.add(p1.pos));
		}
		for (let j = 0; j < 3; j++){//back of tail
			const p1 = this.body.nodes[this.cytoplasmNodeCount-1];
			const p2 = this.body.nodes[this.cytoplasmNodeCount];
			
			const normalVec = p1.pos.sub(p2.pos).normalizeSelf().rotateRadiansSelf(Math.PI/4*(j+3)).mulScalarSelf(this.thicknessAt[this.cytoplasmNodeCount-1]); //angle to next Node... if last node return previous value
			this.bodyPoints[i].copy(normalVec.add(p1.pos));
			i++;
		}
		for (let j = this.cytoplasmNodeCount - 1; j >= 0; j--){ //start with the side of the head -> side of tail
			const p1 = this.body.nodes[j];
			const p2 = this.body.nodes[j+1];
			
			const normalVec = p1.pos.sub(p2.pos).normalizeSelf().rotateRadiansSelf(-Math.PI/2).mulScalarSelf(this.thicknessAt[j]); //angle to next Node... if last node return previous value
			this.bodyPoints[i].copy(normalVec.add(p1.pos));
			i++;
		}
		for (let j = 0; j < 3; j++){//back of tail
			const p1 = this.body.nodes[0];
			const p2 = this.body.nodes[1];
			
			const normalVec = p1.pos.sub(p2.pos).normalizeSelf().rotateRadiansSelf(Math.PI/4*(j-1)).mulScalarSelf(this.thicknessAt[0]); //angle to next Node... if last node return previous value
			this.bodyPoints[i].copy(normalVec.add(p1.pos));
			i++;
		}
	}
	player(){
		if (mouse.pressLeft)
			this.AI.targetDir.copy(mouse.pos.sub(this.head.pos).normalizeSelf());
		else
			this.AI.targetDir.set(0, 0);
	}
	tick(t){
		if (this.AI.isPlayer) this.player();
		//this.AI.targetDir
		this.head.force.addSelf(this.AI.targetDir.mulScalar(5).rotateRadiansSelf(Math.sin(t)));
		this.body.tick(t);
	}
	draw(){
		for (let i = 0; i < this.cytoplasmNodeCount; i++){
			ctx.beginPath();
			const point = this.body.nodes[i].pos;
			const w = this.thicknessAt[i] * 0.8;
			ctx.ellipse(point.x, point.y, w, w, 0, 0, Math.PI * 2);
			ctx.fillStyle = "#00FF00";
			ctx.fill();
			ctx.closePath();
		}
		this.calcParametric();

		//body
		{
			const startPoint = this.bodyPoints[this.bodyPoints.length - 1]; //Vector
			ctx.beginPath();
			ctx.moveTo(startPoint.x, startPoint.y);
			
			for (let i = 0; i <= this.bodyPoints.length; i++){
				const point = this.bodyPoints[i % this.bodyPoints.length];
				ctx.lineTo(point.x, point.y);
			}
			ctx.fill();
			ctx.closePath();
		}
		//flagellum
		{
			const startPoint = this.body.nodes[this.cytoplasmNodeCount];
			ctx.moveTo(startPoint.x, startPoint.y);
			ctx.beginPath();
			for (let i = this.cytoplasmNodeCount; i < this.nodeCount; i++){
				const point = this.body.nodes[i].pos;
				ctx.lineTo(point.x, point.y);
			}
			ctx.strokeStyle = "#00FF00";
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.closePath();
		}
	}
}