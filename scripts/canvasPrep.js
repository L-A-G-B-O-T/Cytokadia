"use strict";

const canvas = document.getElementById("mainCanvas");

//This game will try to fit whatever window, so I will need to center my ctx drawings accordingly
canvas.height = 620;
canvas.width = 620 * (window.innerWidth - 20) / (window.innerHeight - 20);
const canvasScaleFactor = canvas.height/(window.innerHeight - 20);

const ctx = canvas.getContext("2d");

ctx.fillStyle = "white";
ctx.fillRegularPolygon = function(centerX, centerY, radius, rotation, sides){
	let dir = rotation - Math.PI * 2 / sides;
	ctx.moveTo(centerX + Math.cos(dir)*radius, centerY + Math.sin(dir)*radius);
	ctx.beginPath();
	for (let dir = rotation; dir < rotation + Math.PI * 2; dir += Math.PI * 2 / sides){
		ctx.lineTo(centerX + Math.cos(dir)*radius, centerY + Math.sin(dir)*radius);
	}
	ctx.fill();
	ctx.closePath();
};
ctx.strokeCircle = function(center, radius, angleStart, angleEnd){
	ctx.beginPath();
	ctx.ellipse(center.x, center.y, radius, radius, 0, angleStart, angleEnd);
	ctx.closePath();
	ctx.stroke();
}
ctx.fillDot = function(center, radius, color){
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.ellipse(center.x, center.y, radius, radius, 0, 0, Math.PI*2);
	ctx.closePath();
	ctx.fill();
}


ctx.fillRegularPolygon(canvas.width / 2, canvas.height / 2, 100, 0, 3);

const minLimit = new Vector(-20, -20);
const maxLimit = new Vector(20, 20);

function randomIntegerArray(count) {
  const shuffled = [];
  for (let i = 0; i < count; i++){
	shuffled.push(i);
  }
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

function findClosestNodeInLine(obj, line, low, high){ //bug: sometimes has infinite loop
	if (!(obj.pos instanceof Vector))
		throw TypeError("obj.pos not of type Vector() in findClosestNodesInLine(obj, line)");
	if (!(line[0] instanceof Node))
		throw TypeError("line is not of type Node[] in findClosestNodesInLine(obj, line)");
	//start with nodes on the opposite ends of the line
	if (high == -1) high = line.length - 1;
	const nodeStart = line.at(low);
	const nodeEnd = line.at(high);
	const mid = low + Math.floor((high - low) / 2);
	if (high - low < 2) return mid;
	if (nodeStart.pos.distanceFrom(obj.pos) < nodeEnd.pos.distanceFrom(obj.pos)){
		return findClosestNodeInLine(obj, line, low, mid);
	} else {
		return findClosestNodeInLine(obj, line, mid, high);
	}
}

function findClosestNodeInLoop(obj, loop){
	if (!(obj.pos instanceof Vector))
		throw TypeError("obj.pos not of type Vector() in findClosestNodesInLoop(obj, loop)");
	if (!(loop[0] instanceof Node))
		throw TypeError("loop is not of type Node[] in findClosestNodesInLoop(obj, loop)");
	if (loop.length < 4)
		throw EvalError("loop.length < 4 in findClosestNodesInLoop(obj, loop)");
	//prerequisite: obj.pos must exist as a Vector()
	//start with two nodes on opposite sides of the loop
	//depending on which one's closer, recursively call findClosestNodeInLine
	const node1 = loop.at(0);
	const node2 = loop.at(Math.floor(loop.length/2));
	const firstQuarter = Math.floor(loop.length/4);
	const thirdQuarter = Math.floor(loop.length*3/4);
	if (node1.pos.distanceFrom(obj.pos) < node2.pos.distanceFrom(obj.pos)){
		const halfLoop = loop.slice(thirdQuarter).concat(loop.slice(0, firstQuarter + 1));
		const index = findClosestNodeInLine(obj, halfLoop, 0, -1); // return the loop index equivalent to the halfloop index
		return (index + thirdQuarter) % loop.length;
	} else {
		const halfLoop = loop.slice(firstQuarter, thirdQuarter + 1);
		const index = findClosestNodeInLine(obj, halfLoop, 0, -1); // return the loop index equivalent to the halfloop index
		return index + firstQuarter;
	}

}

