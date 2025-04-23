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
	ctx.stroke();
	ctx.closePath();
}


ctx.fillRegularPolygon(canvas.width / 2, canvas.height / 2, 100, 0, 3);

const minLimit = new Vector(-5, -5);
const maxLimit = new Vector(5, 5);