class Biome {
    constructor(){
        this.name = "";
        this.id = Number();
        this.generate = function(){}
    }
}

Biome.capillaryBed = new Biome(); //temporary biome
Biome.capillaryBed.generate = function(callback){
    let graph = new GR_Graph();
    const enter = graph.addNode(new Vector(0, 300), 999);
    const middle = graph.addNode(new Vector(Math.random() * 100 + 425, Math.random() * 100 + 250), 0);
    const exit = graph.addNode(new Vector(950, 300), 999);
    graph.connectNodes(enter, middle);
    graph.connectNodes(exit, middle);
    graph.sizeCap = 40; //not a hard cap; just signals when the graph is big enough
    graph.minBound = new Vector(0, 0);
    graph.maxBound = new Vector(canvas.width, canvas.height);

    graph.runRule = function(node){
        if (graph.size() > graph.sizeCap) return true;
        if (node != enter && node != exit){
            //replace node with a dimer or a tri-loop
            if (node.neighbors.size <= 2 || node.neighbors.size == 3 && Math.random() < 0.5){//tri-loop
                const newCenter = node.pos.clone();
                const radius = new Vector(-30, 0);
                node.pos.copy(newCenter.add(radius));

                radius.rotateDegreesSelf(120);
                const node2 = graph.addNode(newCenter.add(radius), node.value);
                
                radius.rotateDegreesSelf(120);
                const node3 = graph.addNode(newCenter.add(radius), node.value);

/*                 const node4 = graph.addNode(newCenter, node.value); */
                

                const it = node.neighbors.values();
                let disconnects = [];

                while (node.neighbors.size > 1){
                    const nb = it.next().value;
                    graph.disconnectNodes(nb, node);
                    disconnects.push(nb);
                }
                graph.connectNodes(node2, node);
                graph.connectNodes(node3, node);
                graph.connectNodes(node2, node3);
                graph.connectNodes(node2, disconnects[0]);
/*                 graph.connectNodes(node4, node);
                graph.connectNodes(node4, node2);
                graph.connectNodes(node4, node3); */
                if (disconnects[1] != undefined) graph.connectNodes(node3, disconnects[1]);
                node.value += 1;
                node2.value += 1;
                graph.nodeOrder.add(node2);
                node3.value += 1;
                graph.nodeOrder.add(node3);
/*                 node4.value += 0;
                graph.nodeOrder.add(node4); */

            } else {//dimer
                const newCenter = node.pos.clone();
                const radius = new Vector(-30, 0);
                node.pos.copy(newCenter.add(radius));
                radius.rotateDegreesSelf(180);
                const node2 = graph.addNode(newCenter.add(radius), node.value);

                const it = node.neighbors.values();
                let disconnects = [];
                let disconnectBool = true;
                while (node.neighbors.size > 1){
                    const nb = it.next().value;
                    if (disconnectBool){
                        graph.disconnectNodes(nb, node);
                        disconnects.push(nb);
                    }
                    disconnectBool = !disconnectBool;
                }
                graph.connectNodes(node2, node);
                disconnects.forEach(disconnect => {
                    graph.connectNodes(disconnect, node2);
                });
                node.value += 4;
                node2.value += 4;
                graph.nodeOrder.add(node2);
            }
        }
        return false;
    }
    graph.nodeOrder = new GR_PriorityQueue();
    graph.nodes.forEach(node => {graph.nodeOrder.add(node)});
    graph.iterate = function(){
        let successful = true;
            for (let i = 0; i < this.size(); i++){
                const node = graph.nodeOrder.remove();
                successful = successful && graph.runRule(node);
                graph.nodeOrder.add(node)
            }
            return successful;
    }
    graph.spaceNode = function(node){
        const acc = new Vector(0, 0);
        let count = 0;
        for (let ni = 0; ni < graph.size(); ni++){
            const nb = graph.getNode(ni);
            count++;
            const disp = nb.pos.sub(node.pos);
            acc.subSelf(disp.normalize().mulScalarSelf(Math.min(100, 50000/(disp.length()**2))));
            if (node.neighbors.has(nb)){
                acc.addSelf(nb.pos.sub(node.pos));
            }
        }
        acc.divScalarSelf(count);
        node.pos.addSelf(acc);
        node.pos.clampSelf(graph.minBound, graph.maxBound);
        if (node == enter) node.pos.set(0);
        if (node == exit) node.pos.set(950)
    }
    graph.spaceOut = function(){
        for (let i = 0; i < graph.sizeCap*5; i++){
            const index = graph.randomNodeIndex();
            const node = graph.getNode(index);
            graph.spaceNode(node);
        }
    }
    for (let i = 0; i < 30; i++){
        graph.iterate();
        graph.spaceOut();
    }
    for (let i = 0; i < 500; i++)
        graph.spaceOut();
    callback();
}