var header = document.getElementById("header");
header.width = window.innerWidth;
header.height = window.innerHeight * 0.2;
var ctxHeader = header.getContext("2d");

var windUpHour = 6;
var wakeUpHour = 7;
var windDownHour = 19;
var sleepHour = 20;

const moonImg = new Image();
moonImg.src = "./pics/SeekPng.com_full-moon-png_129464.png";

const sunImg = new Image();
sunImg.src = "./pics/SeekPng.com_sunshine-effect-png_2583831.png";

var padding = 10;
var imageSize = header.height - 2 * padding;

function GetTimeFloat() {
    var date = new Date();
    // var currentTime =  date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
    var currentTime = 24 * (date.getSeconds() / 60);

    console.log("[time] currentTime: " + currentTime);

    return currentTime;
}

function GetSunPosition() {
    var time = GetTimeFloat();
    var positionPercent = 0;

    if (time < wakeUpHour || time > sleepHour)
        positionPercent = 0;
    else
        positionPercent = (time - wakeUpHour) / (sleepHour - wakeUpHour) * 100;

    var position = (header.width + imageSize) * positionPercent / 100 - imageSize;

    console.log("[sun] imageSize: " + imageSize + ", header.width: " + header.width + ", position: " + position + ",  positionPercent: " + positionPercent)

    return position;
}

function GetMoonPosition() {
    var time = GetTimeFloat();
    var positionPercent = 0;

    if (time > wakeUpHour && time < sleepHour)
        positionPercent = 0;
    else
        if (time < wakeUpHour)
            positionPercent = (24 - sleepHour + time) / (24 - sleepHour + wakeUpHour) * 100;
        else
            positionPercent = (time - sleepHour) / (24 - sleepHour + wakeUpHour) * 100;

    var position = (header.width + imageSize) * positionPercent / 100 - imageSize;

    console.log("[moon] imageSize: " + imageSize + ", header.width: " + header.width + ", position: " + position + ",  positionPercent: " + positionPercent)

    return position;
}

function DrawMoon() {
    ctxHeader.drawImage(
        moonImg, 
        GetMoonPosition(), padding,
        imageSize, imageSize
    );
};

function DrawSun() {
    ctxHeader.drawImage(
        sunImg, 
        GetSunPosition(), padding,
        imageSize, imageSize
    );
};

function CleanHeader() {
    var time = GetTimeFloat();
    var color;

    if (time >= wakeUpHour && time < windDownHour)
        color = 'lightgreen';
    else if (time >= windDownHour && time < sleepHour)
        color = 'green';
    else if (time >= sleepHour || time < windUpHour)
        color = 'grey';
    else
        color = 'lightgrey';

    ctxHeader.fillStyle = color;
    ctxHeader.fillRect(0, 0, header.width, header.height);
}

function DrawHeader() {
    CleanHeader();
    DrawMoon();
    DrawSun();
}

moonImg.onload = function() {
    sunImg.onload = function() {
        DrawHeader();
    }
}

setInterval(DrawHeader, 1000);