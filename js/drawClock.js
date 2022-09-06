var clock = document.getElementById("clock");
clock.height = window.innerHeight * 0.8;
clock.width = window.innerWidth;
var ctx = clock.getContext("2d");
var radius = clock.height / 2 * 0.90

var translateX = window.innerWidth / 2;
var translateY = clock.height / 2;

ctx.font = radius * 0.15 + "px arial";
ctx.textBaseline = "middle";
ctx.textAlign = "center";

function Clean() {
  ctx.fillStyle = 'antiquewhite';
  ctx.fillRect(0, 0, clock.width, clock.height);
}

function drawClock() {
  Clean();
  drawDigital(ctx);
  drawDate(ctx);
  drawWeekDays(ctx);
  ctx.translate(translateX, translateY);
  drawFace(ctx, radius);
  drawNumbers(ctx, radius);
  drawTime(ctx, radius);
  ctx.translate(- translateX, - translateY);
}

function drawWeekDays(ctx) {
  var date = new Date();
  var daysSvk = [
    "PONDELOK",
    "UTOROK",
    "STREDA",
    "ŠTVRTOK",
    "PIATOK",
    "SOBOTA",
    "NEDELA"
  ];
  var daysFin = [
    "MAANANTAI",
    "TIISTAI",
    "KESKIVIIKKO",
    "TORSTAI",
    "PERJANTAI",
    "LAUANTAI",
    "SUNNUNTAI",
  ]
  var daysColors = [
    "green",
    "blue",
    "white",
    "brown",
    "yellow",
    "pink",
    "red"
  ]
  var jsIndex = [
    1,
    2,
    3,
    4,
    5,
    6,
    0
  ]

  ctx.font = radius * 0.1 + "px arial";
  ctx.textAlign = "left";

  for (let index = 0; index < daysSvk.length; index++) {
    if ((date.getDay() || 7) == index + 1) {
      ctx.fillStyle = "black";
      ctx.fillRect(clock.width - 200 - 5, window.innerHeight * 0.1 + index * 80 - 30, 200, 85);
      ctx.fillStyle = "antiquewhite";
      ctx.fillRect(clock.width - 200 - 3, window.innerHeight * 0.1 + index * 80 - 30 + 2, 196, 81);
    }

    ctx.font = radius * 0.1 + "px arial";
    ctx.textAlign = "left";
    ctx.fillStyle = daysColors[index];
    ctx.fillText(daysSvk[index], clock.width - 200, window.innerHeight * 0.1 + index * 80);
    ctx.fillText(daysFin[index], clock.width - 200, window.innerHeight * 0.1 + index * 80 + 30);
  }
}

function drawDigital(ctx) {
  var date = new Date();
  var h = date.getHours(); // 0 - 23
  var m = date.getMinutes(); // 0 - 59

  h = (h < 10) ? "0" + h : h;
  m = (m < 10) ? "0" + m : m;

  var time = h + ":" + m

  ctx.fillStyle = "black";
  ctx.font = radius * 0.4 + "px arial";
  ctx.textAlign = "center";
  ctx.fillText(time, radius / 2, radius / 3);
}

function drawDate(ctx) {
  var date = new Date();
  var m = date.getMonth() + 1; // 0 - 11
  var d = date.getDate(); // 1 - 31

  d = (d < 10) ? "0" + d : d;
  m = (m < 10) ? "0" + m : m;

  var date = d + "." + m + "."

  ctx.fillStyle = "black";
  ctx.font = radius * 0.4 + "px arial";
  ctx.textAlign = "center";
  ctx.fillText(date, radius / 2 + 20, window.innerHeight - radius * 0.8);
}

function drawFace(ctx, radius) {
  var grad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();
  grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
  grad.addColorStop(0, '#333');
  grad.addColorStop(1, '#333');
  ctx.strokeStyle = grad;
  ctx.lineWidth = radius * 0.05;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.05, 0, 2 * Math.PI);
  ctx.fillStyle = '#333';
  ctx.fill();
}

function drawNumbers(ctx, radius) {
  var ang;
  var num;

  ctx.fillStyle = "black";
  ctx.font = radius * 0.15 + "px arial";
  ctx.textAlign = "center";

  for(num = 1; num < 13; num++){
    ang = num * Math.PI / 6;
    ctx.rotate(ang);
    ctx.translate(0, -radius*0.85);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius*0.85);
    ctx.rotate(-ang);
  }
}

function drawTime(ctx, radius){
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    //hour
    hour=hour%12;
    hour=(hour*Math.PI/6)+
    (minute*Math.PI/(6*60))+
    (second*Math.PI/(360*60));
    drawHand(ctx, hour, radius*0.5, radius*0.07);

    //minute
    minute=(minute*Math.PI/30)+(second*Math.PI/(30*60));
    drawHand(ctx, minute, radius*0.7, radius*0.07);
    
    // second
    second=(second*Math.PI/30);
    drawHand(ctx, second, radius*0.9, radius*0.02);
}

function drawHand(ctx, pos, length, width) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
}

drawClock();
setInterval(drawClock, 1000);
