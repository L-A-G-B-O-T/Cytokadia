class GR_PriorityQueue {
    constructor(lessThanCmp) {
        this.heap = [];
        this.lessThanCmp = function(a, b){
            return a < b;
        };
        if (lessThanCmp != undefined) this.lessThanCmp = lessThanCmp;
    }

    // Helper Methods
    getLeftChildIndex(parentIndex) {
        return 2 * parentIndex + 1;
    }

    getRightChildIndex(parentIndex) {
        return 2 * parentIndex + 2;
    }

    getParentIndex(childIndex) {
        return Math.floor((childIndex - 1) / 2);
    }

    hasLeftChild(index) {
        return this.getLeftChildIndex(index)
            < this.heap.length;
    }

    hasRightChild(index) {
        return this.getRightChildIndex(index)
            < this.heap.length;
    }

    hasParent(index) {
        return this.getParentIndex(index) >= 0;
    }

    leftChild(index) {
        return this.heap[this.getLeftChildIndex(index)];
    }

    rightChild(index) {
        return this.heap[this.getRightChildIndex(index)];
    }

    parent(index) {
        return this.heap[this.getParentIndex(index)];
    }

    swap(indexOne, indexTwo) {
        const temp = this.heap[indexOne];
        this.heap[indexOne] = this.heap[indexTwo];
        this.heap[indexTwo] = temp;
    }

    peek() {
        if (this.heap.length === 0) {
            return null;
        }
        return this.heap[0];
    }

    // Removing an element will remove the
    // top element with highest priority then
    // heapifyDown will be called 
    remove() {
        if (this.heap.length === 0) {
            return null;
        }
        const item = this.heap[0];
        this.heap[0] = this.heap[this.heap.length - 1];
        this.heap.pop();
        this.heapifyDown();
        return item;
    }

    add(item) {
        this.heap.push(item);
        this.heapifyUp();
    }

    heapifyUp() {
        let index = this.heap.length - 1;
        while (this.hasParent(index) && this.lessThanCmp(this.heap[index], this.parent(index))) {
            this.swap(this.getParentIndex(index), index);
            index = this.getParentIndex(index);
        }
    }

    heapifyDown() {
        let index = 0;
        while (this.hasLeftChild(index)) {
            let smallerChildIndex = this.getLeftChildIndex(index);
            if (this.hasRightChild(index) && this.lessThanCmp(this.rightChild(index), this.leftChild(index))) {
                smallerChildIndex = this.getRightChildIndex(index);
            }
            if (this.lessThanCmp(this.heap[index], this.heap[smallerChildIndex])) {
                break;
            } else {
                this.swap(index, smallerChildIndex);
            }
            index = smallerChildIndex;
        }
    }
}

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
