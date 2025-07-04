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

const minLimit = new Vector(-5, -5);
const maxLimit = new Vector(5, 5);

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