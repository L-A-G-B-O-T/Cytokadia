"use strict";

class Globular { //globular material
    static lifespan = Number();
    static fill = String();
    static minNodeCount = Number();
    static maxNodeCount = Number();
    static minRadius = Number();
    static maxRadius = Number();
    static squishFactor = Number();

    constructor(start){
        //represent self with a soft body
        const nC = randint(this.constructor.minNodeCount, this.constructor.maxNodeCount);
        const radius = randint(this.constructor.minRadius, this.constructor.maxRadius);
        this.body = new StrictSoftBody(nC, radius, start, this.constructor.squishFactor);
        this.lifeLeft = this.constructor.lifespan;
    }
    tick(t){
		this.body.tick(t);
        this.lifeLeft--;
	}
	draw(){
		ctx.save();
		{//circular body
			ctx.fillStyle = this.constructor.fill;
			
			let curve = [];

			this.body.nodes.forEach(node => {
				curve.push(node.pos.x, node.pos.y);
			});
			ctx.beginPath();
			ctx.curve(curve, 0.0, 5, true);
            
            ctx.closePath();
			ctx.fill();
			
		}
		ctx.restore();
	}
}

class Rigid { //just nodes that spin
    static lifespan = Number();
    static fill = String();
    static minRadius = Number();
    static maxRadius = Number();
    static maxSides = Number();
    static minSides = Number();
    constructor(start){
        this.node = new Node();
        this.node.pos.copy(start);
        this.node.posPrev.copy(start);
        const sides = randint(this.constructor.minSides, this.constructor.maxSides);
        const radius = randint(this.constructor.minRadius, this.constructor.maxRadius);
        this.radius = radius;
        this.sides = sides;
        this.lifeLeft = this.constructor.lifespan;
        this.rotPos = 0;
        this.rotVel = 0.1;
    }
    tick(t){
        this.node.physicsTick(t, 1.0);
        this.rotPos += this.rotVel;
        this.lifeLeft--;
    }
    draw(){
        ctx.save();
		{//circular body
			ctx.fillStyle = this.constructor.fill;
            ctx.globalAlpha = this.lifeLeft / this.constructor.lifespan
			
			let curve = [];
            const radVector = new Vector(this.radius, 0);
            radVector.rotateRadiansSelf(this.rotPos);

			for (let i = 0; i < this.sides; i++){
                const vertex = radVector.add(this.node.pos);
                curve.push(vertex.x, vertex.y);
                radVector.rotateDegreesSelf(360 / this.sides);
            }
			ctx.beginPath();
			ctx.curve(curve, 0.0, 5, true);
            
            ctx.closePath();
			ctx.fill();
			
		}
		ctx.restore();
    }
}

class Granule extends Rigid {
    static lifespan = Number(100);
    static fill = String("#00FF00");
    static minSides = Number(3);
    static maxSides = Number(6);
    static minRadius = Number(10);
    static maxRadius = Number(15);
}