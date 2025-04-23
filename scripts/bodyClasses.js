class HardWormBody { //DistanceConstraint(Node, Node) in a line
	constructor(nodeCount, internodeLength, headPos, flexibility){
		if (!(headPos instanceof Vector))
			throw TypeError(`headPos of HardWormBody should be <Vector>, not <${headPos.constructor.name}>`);
		this.nodes = [];
		this.edges = [];
		this.angles = [];
		for (let i = 0; i < nodeCount; i++){
			const newNode = new Node();
			newNode.pos.copy(headPos.addScalar(i*internodeLength/Math.sqrt(2)));
			newNode.posPrev = newNode.pos.clone();
			this.nodes.push(newNode);
		}
		for (let i = 1; i < nodeCount; i++){
			const newEdge = new DistanceConstraint();
			newEdge.A = this.nodes[i - 1];
			newEdge.B = this.nodes[i];
			newEdge.distance = internodeLength;
			this.edges.push(newEdge);
		}
		for (let i = 1; i < nodeCount - 1; i++){
			const newAngle = new AngleConstraint_OneWay();
			newAngle.A = this.nodes[i - 1];
			newAngle.B = this.nodes[i];
			newAngle.C = this.nodes[i + 1];
			newAngle.minAngle = Math.PI - flexibility;
            newAngle.maxAngle = Math.PI + flexibility;
			this.angles.push(newAngle);
		}
	}
	tick(t){
		for (const edge of this.edges){
			edge.constrain();
		}
		for (const angle of this.angles){
			angle.constrain();
		}
		for (const node of this.nodes){
			node.physicsTick(t, 0.9);
		}
	}
}

class SoftWormBody { //SpringEdge(Node, Node) in a line
	constructor(nodeCount, internodeLength, headPos){
		if (!(headPos instanceof Vector))
			throw TypeError(`headPos of SoftWormBody should be <Vector>, not <${headPos.constructor.name}>`);
		this.nodes = [];
		this.edges = [];
		this.angles = [];
		for (let i = 0; i < nodeCount; i++){
			const newNode = new Node();
			newNode.pos.copy(headPos.addScalar(i*15));
			newNode.posPrev = newNode.pos.clone();
			this.nodes.push(newNode);
		}
		for (let i = 1; i < nodeCount; i++){
			const newEdge = new SpringEdge();
			newEdge.A = this.nodes[i - 1];
			newEdge.B = this.nodes[i];
			newEdge.restLength = internodeLength;
			newEdge.stiffness = 0.6;
			this.edges.push(newEdge);
		}
		for (let i = 1; i < nodeCount - 1; i++){
			const newAngle = new SpringEdge();
			newAngle.A = this.nodes[i - 1];
			newAngle.B = this.nodes[i + 1];
			newAngle.restLength = internodeLength * 2;
			newAngle.stiffness = 0.5;
			this.angles.push(newAngle);
		}
	}
	tick(t){
		for (const edge of this.edges){
			edge.calcForce();
		}
		for (const angle of this.angles){
			angle.calcForce();
		}
		for (const node of this.nodes){
			node.physicsTick(t, 0.9);
		}
		if (mouse.pressLeft)
			this.nodes[0].pos.copy(mouse.pos);
	}
}

function insertionSort(arr){
	for (let i = 1; i < arr.length; i++){
		let insert_index = i;
		let current_value = arr[i];
		for (let j = i - 1; j < -1; j--){
			if (arr[j] > current_value){
				arr[j + 1] = arr[j];
				insert_index = j;
			} else {
				break;
			}
		}
		arr[insert_index] = current_value;
	}
}

class PressureSoftBody { //SpringEdge(Node, Node) in a loop
	constructor(nodeCount, radius, centerPoint){
		if (!(centerPoint instanceof Vector))
			throw TypeError(`centerPoint of PressureSoftBody should be <Vector>, not <${centerPoint.constructor.name}>`);
		this.nodes = [];
		this.edges = [];
		this.angles = [];
		
		
		const radVector = new Vector(radius, 0);

		for (let i = 0; i < nodeCount; i++){
			const newNode = new Node();
			newNode.pos.copy(centerPoint);
			newNode.pos.addSelf(radVector.rotateRadiansSelf(Math.PI * 2 / nodeCount));
			newNode.posPrev = newNode.pos.clone();
			this.nodes.push(newNode);
		}
		this.idealArea = this.findArea();
		this.pressureStiffness = 50;

		const internodeLength = Math.sqrt(2*radius**2*(1 - Math.cos(2*Math.PI/nodeCount)));
		for (let i = 0; i < nodeCount; i++){
			const newEdge = new SpringEdge();
			newEdge.A = this.nodes[(i)%nodeCount];
			newEdge.B = this.nodes[(i+1)%nodeCount];
			newEdge.restLength = internodeLength;
			newEdge.stiffness = 0.8;
			this.edges.push(newEdge);
			
			const newAngle = new AngleConstraint();
			newAngle.A = this.nodes[(i)%nodeCount];
			newAngle.B = this.nodes[(i + 1)%nodeCount];
			newAngle.C = this.nodes[(i + 2)%nodeCount];
			newAngle.minAngle = Math.PI/2;
			this.angles.push(newAngle);
		}
		
		this.sortedNodes = this.nodes.toSorted(Node.xposGreater);
	}
	findArea(){
		//trapezoid formula
		let ret = 0;

		for (let i = 0; i < this.nodes.length; i++){
			const p1 = this.nodes[i].pos.toArray();
			const p2 = this.nodes[(i + 1) % this.nodes.length].pos.toArray();

			const width = p1[0] - p2[0];
			const height = (p1[1] + p2[1])/2;

			ret += width * height;
		}
		
		return ret;
	}
	pressureForce(environmentalPressure){
		const forceMagnitude = this.pressureStiffness * (this.idealArea / this.findArea() - 1);//outward pressure
		
		for (let i = 0; i < this.nodes.length; i++){
			const node = this.nodes[(i+1)%this.nodes.length];
			const prevNode = this.nodes[i];
			const nextNode = this.nodes[(i+2)%this.nodes.length];

			const normalVec = nextNode.pos.sub(prevNode.pos).rotateRadiansSelf(-Math.PI/2).normalizeSelf();
			
			node.force.addSelf(normalVec.mulScalarSelf(forceMagnitude));			
		}
	}
	collideNodes(){
		//insertion Sort the this.sortedNodes
		insertionSort(this.sortedNodes);
		for (let i = 0; i < this.sortedNodes.length; i++) {
			const node1 = this.sortedNodes[i];
			// check each of the other balls
			for (let j = i + 1; j < this.sortedNodes.length; j++) {
				const node2 = this.sortedNodes[j];
		 
				// stop when too far away
				if (node2.left > node1.right) break;
		 
			  // check for collision
				node1.collideWithNode(node2, 8);
			}
		}
		
	}
	tick(t){
		for (const angle of this.angles){
			//angle.constrain();
		}
		for (const edge of this.edges){
			edge.calcForce();
		}
		
		this.pressureForce();
		
		this.collideNodes();		
		
		for (const node of this.nodes){
			//node.force.addSelf(new Vector(0, 0.1));
			node.physicsTick(t, 0.9);
		}
	}
}

class CompoundBody {
    constructor(){
        this.referencedBodies = new WeakSet();
        this.nodes = []; //stores references to Node() objects, in order of .physicsTick() execution
        this.distConstraints = []; //stores references to DistanceConstraint objects, in order of constrain() execution
        this.springs = []; //stores references to SpringEdge() objects
        this.angles = []; //stores references to AngleConstraint() and AngleConstraint_OneWay() objects, in order of constrain() execution
    }
    offloadNodes(body){
        this.referencedBodies.add(body);
        for (const node of body.nodes)
            this.nodes.push(node);
    }
    offloadEdges(body, typeArr){
        if (!this.referencedBodies.has(body))
            throw ReferenceError("offloadEdges(body, typeArr) returns false for CompoundBody.referncedBodies.has(body)");
        if (!(typeArr == this.distConstraints || typeArr == this.springs))
            throw TypeError("offloadEdges(body, typeArr) returns false for typeArr == springs or distconstraints");
        for (const edge of body.edges){
            typeArr.push(edge);
        }
    }
    linkDC(body1, body2, body1NodeIndex, body2NodeIndex){
        if (!this.referencedBodies.has(body1))
            throw ReferenceError("linkDC(body1, body2, body1NodeIndex, body2NodeIndex) returns false for CompoundBody.referncedBodies.has(body1)");
        const newEdge = new DistanceConstraint();
        newEdge.A = body1.nodes[body1NodeIndex];
        newEdge.B = body2.nodes[body2NodeIndex];
        this.distConstraints.push(newEdge);
        this.offloadNodes(body2);

        return newEdge;
    }
    offloadAngles(body){
        if (!this.referencedBodies.has(body))
            throw ReferenceError("offloadAngles(body) returns false for CompoundBody.referncedBodies.has(body)");
        for (const angle of body.angles){
            this.angles.push(angle);
        }
    }
    tick(t){
		for (const edge of this.distConstraints){
			edge.constrain();
		}
        for (const edge of this.springs){
			edge.calcForce();
		}
		for (const angle of this.angles){
			angle.constrain();
		}
		for (const node of this.nodes){
			node.physicsTick(t, 0.9);
		}
	}
}