class GR_Node {
    constructor(start, value){
        this.pos = start;
        this.value = null;
        if (value != undefined) this.value = value;
        this.neighbors = new Set();
    }
}

class GR_Graph {
    constructor(){
        this.nodes = [];
        this.runRule = function(node){};
        this.iterate = function(){
        let successful = true;
            for (let i = 0; i < this.size(); i++){
                const index = this.randomNodeIndex();
                const node = this.getNode(index);
                successful = successful && this.runRule(node);
            }
            return successful;
        }
    }
    addNode(start, value){
        const n = new GR_Node(start, value);
        this.nodes.push(n);
        return n;
    }
    getNode(index){
        return this.nodes[index];
    }
    size(){
        return this.nodes.length;
    }
    connectNodes(node1, node2){
        node1.neighbors.add(node2);
        node2.neighbors.add(node1);
    }
    disconnectNodes(node1, node2){
        node1.neighbors.delete(node2);
        node2.neighbors.delete(node1);
    }
    newDist(node1, node2, dist){
        const disp = node2.pos.sub(node1.pos);
        const newdisp = disp.normalize().mulScalarSelf(dist);
        node2.pos.copy(node1.pos.add(newdisp));
    }
    randomNodeIndex(){
        return Math.floor(Math.random() * this.nodes.length);
    }
}
