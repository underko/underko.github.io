var header = document.getElementById("header");
header.width = window.innerWidth;
header.height = window.innerHeight * 0.2;
var ctxHeader = header.getContext("2d");

var padding = 10;
var imageSize = header.height - 2 * padding;
var positionPercent = 50;
var position = (header.width + imageSize) * positionPercent / 100 - imageSize;

console.log("imageSize: " + imageSize + ", header.width: " + header.width + ", position: " + position)

var drawMoon = function () {
  const img = new Image();
  img.src = "./pics/SeekPng.com_full-moon-png_129464.png";
  img.onload = () => {
    ctxHeader.drawImage(
        img, 
        position, padding,
        imageSize, imageSize);
  };
};

drawMoon();
setInterval(drawMoon, 1000);