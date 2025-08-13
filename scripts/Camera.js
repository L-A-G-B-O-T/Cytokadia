"use strict";

const Camera = {
    pan : new Vector(0, 0),
    zoom : 1.0,
    mode : 'S',
    targetPos : new Vector(0, 0),
	targetObj : null,
    targetZoom : 1,
    /*
    Various modes:
    S: SET, pan = target position
    F: FADE, pan exponentially approaches target position
    */
    update(){
		if (this.targetObj != null){
			this.targetPos.set(this.targetObj.pos.x, this.targetObj.pos.y)
		}
        switch (this.mode){
			case 'S':
                {
                    this.pan.copy(this.targetPos);
                } break;
            case 'F':
                {
                    this.pan.addSelf(this.targetPos.add(this.pan).divScalarSelf(2));
                } break;
            default:
                {
                throw TypeError("Camera.mode is not set to one of the options");
                } break;
        }
        this.zoom = (this.targetZoom + this.zoom) / 2;
		mouse.pos.set((mouse.screenPos.x - canvas.width/2)/this.zoom + this.pan.x, (mouse.screenPos.y - canvas.height/2)/this.zoom + this.pan.y);
		this.drawMouse();
    },
	ctxTransform(){
		ctx.transform(this.zoom, 0, 0, this.zoom, -this.pan.x*this.zoom + canvas.width/2, -this.pan.y*this.zoom + canvas.height /2);
	},
    drawBacterium(bacterium){
        console.assert(bacterium instanceof Bacterium);
		bacterium.calcParametric();
		ctx.save();
		this.ctxTransform();
        ctx.fillStyle = "#00FF00";
		
		{//body
			let curve = [];
			bacterium.bodyPoints.forEach(point => {
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
			bacterium.flagellum.nodes.forEach(node => {
				curve.push(node.pos.x, node.pos.y);
			});
			
			ctx.beginPath();
			ctx.curve(curve);
			ctx.stroke();
		}
		ctx.restore();
	},
    drawCell(cell){
		console.assert(cell instanceof Cell);
		ctx.save();
		this.ctxTransform();
		{//circular body
			ctx.fillStyle = `hsla(${cell.cytoplasmHue}, 100%, 50%, 0.5)`;
			ctx.strokeStyle = "white";
			ctx.lineWidth = 10;
			
			let curve = [];

			cell.cytoplasm.nodes.forEach(node => {
				curve.push(node.pos.x, node.pos.y);
			});
			ctx.beginPath();
			ctx.curve(curve, 0.5, 5, true);

			ctx.fill();
			ctx.closePath();
			ctx.stroke();
		}
		ctx.restore();
	},
    drawRigidMaterial(material){
        ctx.save();
		this.ctxTransform();
		{//circular body
			ctx.fillStyle = material.constructor.fill;
            ctx.globalAlpha = material.lifeLeft / material.constructor.lifespan;

			let curve = [];
            const radVector = new Vector(material.radius, 0);
            radVector.rotateRadiansSelf(material.rotPos);

			for (let i = 0; i < material.sides; i++){
                const vertex = radVector.add(material.node.pos);
                curve.push(vertex.x, vertex.y);
                radVector.rotateDegreesSelf(360 / material.sides);
            }
			
			ctx.beginPath();
			ctx.curve(curve, 0.0, 10, true);
            
			ctx.fill();
		}
		ctx.restore();
		
    },
	drawMaterial(material){
		switch (material.constructor.id){
			case (0): //globular base class
				{

				} break;
			case (1): //rigid base class
				{
					this.drawRigidMaterial(material);
				} break;
			case (2): 
				{

				} break;
			case (3):
				{

				} break;
			case (4):
				{

				} break;
			case (5): //granule class
				{
					this.drawRigidMaterial(material);
				} break;
			default:
				{
					throw RangeError("ID is not accounted for in Camera.drawMaterial(material)")
				} break;
		}
	},
	drawMesh(width){
		ctx.save();
		this.ctxTransform();
		const beginX = Math.floor(this.pan.x / width)*width - canvas.width / 2;
		const endX = this.pan.x + canvas.width / 2;
		const beginY = Math.floor(this.pan.y / width)*width - canvas.height / 2;
		const endY = this.pan.y + canvas.height / 2;
		for (let i = beginX; i < endX; i += width){
			ctx.beginPath();
			ctx.curve([i, beginY, i, endY], 0.0, 1, false);
			ctx.stroke();
		}
		for (let i = beginY; i < endY; i += width){
			ctx.beginPath();
			ctx.curve([beginX, i, endX, i], 0.0, 1, false);
			ctx.stroke();
		}
		ctx.restore();
	},
	drawMouse(){
		ctx.save();
		this.ctxTransform();
		ctx.strokeCircle(mouse.pos, 5, 0, Math.PI*2);
		ctx.restore();
	},

}
