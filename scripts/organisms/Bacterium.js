"use strict";

class Bacterium { //
	constructor(nC, cNC, start){
		this.nodeCount = nC;
		this.cytoplasmNodeCount = cNC;
		//this.flagellumNodeCount = this.nodeCount - this.cytoplasmNodeCount
		
        

		this.cytoplasm = new HardWormBody(cNC, 10, start, Math.PI / 6);
        this.flagellum = new HardWormBody(nC - cNC, 10, this.cytoplasm.nodes[cNC-1].pos.addScalar(5), Math.PI); //change to 3 if there are bugs
        //join the flagellum to the cytoplasm; start with cytoplasm
		this.body = new CompoundBody();
        this.body.offloadNodes(this.cytoplasm);
        this.body.offloadEdges(this.cytoplasm, this.body.distConstraints);
		this.body.offloadAngles(this.cytoplasm);
		//joining section
		const hillock = new AngleConstraint_OneWay(); 
		hillock.minAngle = Math.PI * 5/6;
		hillock.maxAngle = Math.PI * 7/6;
        const link = this.body.linkDC(this.cytoplasm, this.flagellum, cNC - 1, 0,
			hillock,
			undefined,
		);
        link.distance = 10;

		//offload the flagellum
        this.body.offloadEdges(this.flagellum, this.body.distConstraints);
        
        this.body.offloadAngles(this.flagellum);

		this.head = this.body.nodes[0];
		for (const node of this.cytoplasm.nodes)
			node.mass = 10;
		
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
	draw(){ //unused 
		this.calcParametric();
        ctx.fillStyle = "#00FF00";
		
		{//body
			let curve = [];
			this.bodyPoints.forEach(point => {
				curve.push(point.x, point.y);
			});
			
			ctx.beginPath();
			ctx.curve(curve, 0.5, 5, true);
			ctx.fill();
		}
		
		{//flagellum
			ctx.strokeStyle = "#00FF00";
			ctx.lineWidth = 2;
			
			let curve = [];
			this.flagellum.nodes.forEach(node => {
				curve.push(node.pos.x, node.pos.y);
			});
			
			ctx.beginPath();
			ctx.curve(curve);
			ctx.stroke();
		}
	}
}