"use strict";

class Material {
    static lifespan = Number();
    static fill = String();
    static minRadius = Number();
    static maxRadius = Number();
    static id = NaN; //would be number
}

class Globular extends Material { //globular material
    static lifespan = Number();
    static fill = String();
    static minNodeCount = Number();
    static maxNodeCount = Number();
    static minRadius = Number();
    static maxRadius = Number();
    static squishFactor = Number();
    static id = 0; //each "layer" of the heirarchy gets two bits for the id. Granule would be 0101 = 5 in base 10

    constructor(start){
        //represent self with a soft body
        super();
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

class Rigid extends Material { //just nodes that spin
    static lifespan = Number();
    static fill = String("#FFFFFF");
    static minRadius = Number();
    static maxRadius = Number();
    static maxSides = Number();
    static minSides = Number();
    static id = 1; //each "layer" of the heirarchy gets two bits for the id. Granule would be 0101 = 5 in base 10

    constructor(start){
        super();
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

class Fibrous extends Material {
    static id = 2;
}

class Complex extends Material {
    static id = 3;
}

class Granule extends Rigid {
    static lifespan = Number(100);
    static fill = String("#00FF00");
    static minSides = Number(3);
    static maxSides = Number(6);
    static minRadius = Number(10);
    static maxRadius = Number(15);
    static id = 5; //each "layer" of the heirarchy gets two bits for the id. Granule would be 0101 = 5 in base 10
}

class Sugar extends Rigid {
    static lifespan = Number(999);
    static fill = String("#FFFFFF");
    static minRadius = Number(1);
    static maxRadius = Number(2);
    static maxSides = Number(6);
    static minSides = Number(5);
    static id = 9; //each "layer" of the heirarchy gets two bits for the id. Sugar would be 1001 = 9 in base 10
}

class Complement extends Rigid { // have its own draw shape

}

class Antibody extends Complex { // have its own draw shape

}