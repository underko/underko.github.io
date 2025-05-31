// Rewritten to support iOS 12 (Safari 12): ES5 only, no async/await, fetch polyfill needed.

var clock = document.getElementById("clock");
clock.height = window.innerHeight * 0.8;
clock.width = window.innerWidth;
var ctx = clock.getContext("2d");
var radius = clock.height / 2 * 0.90;

var translateX = window.innerWidth / 2;
var translateY = clock.height / 2;

ctx.font = radius * 0.15 + "px arial";
ctx.textBaseline = "middle";
ctx.textAlign = "center";

var lastFetchQuarter = null;
var cachedWeatherData = null;
var cachedWeatherIcon = null;
var wmoCodes = null;

function Clean() {
  ctx.fillStyle = 'antiquewhite';
  ctx.fillRect(0, 0, clock.width, clock.height);
}

function drawClock() {
  Clean();
  drawDigital(ctx);
  drawWeatherWidget(ctx);
  drawDate(ctx);
  drawWeekDays(ctx);
  ctx.translate(translateX, translateY);
  drawFace(ctx, radius);
  drawNumbers(ctx, radius);
  drawTime(ctx, radius);
  ctx.translate(-translateX, -translateY);
}

function drawWeekDays(ctx) {
  var date = new Date();
  var daysSvk = ["PONDELOK", "UTOROK", "STREDA", "ŠTVRTOK", "PIATOK", "SOBOTA", "NEDELA"];
  var daysFin = ["MAANANTAI", "TIISTAI", "KESKIVIIKKO", "TORSTAI", "PERJANTAI", "LAUANTAI", "SUNNUNTAI"];
  var daysColors = ["green", "blue", "white", "brown", "yellow", "pink", "red"];

  ctx.font = radius * 0.1 + "px arial";
  ctx.textAlign = "left";

  for (var index = 0; index < daysSvk.length; index++) {
    if ((date.getDay() || 7) == index + 1) {
      ctx.fillStyle = "black";
      ctx.fillRect(clock.width - 205, window.innerHeight * 0.1 + index * 80 - 30, 200, 85);
      ctx.fillStyle = "antiquewhite";
      ctx.fillRect(clock.width - 203, window.innerHeight * 0.1 + index * 80 - 28, 196, 81);
    }
    ctx.fillStyle = daysColors[index];
    ctx.fillText(daysSvk[index], clock.width - 200, window.innerHeight * 0.1 + index * 80);
    ctx.fillText(daysFin[index], clock.width - 200, window.innerHeight * 0.1 + index * 80 + 30);
  }
}

function drawDigital(ctx) {
  var date = new Date();
  var h = date.getHours();
  var m = date.getMinutes();

  h = (h < 10) ? "0" + h : h;
  m = (m < 10) ? "0" + m : m;

  var time = h + ":" + m;

  ctx.fillStyle = "black";
  ctx.font = radius * 0.4 + "px arial";
  ctx.textAlign = "center";
  ctx.fillText(time, radius / 2, radius / 3);
}

function drawDate(ctx) {
  var dateObj = new Date();
  var m = dateObj.getMonth() + 1;
  var d = dateObj.getDate();

  d = (d < 10) ? "0" + d : d;
  m = (m < 10) ? "0" + m : m;

  var date = d + "." + m + ".";

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
  var ang, num;
  ctx.fillStyle = "black";
  ctx.font = radius * 0.15 + "px arial";
  ctx.textAlign = "center";

  for (num = 1; num < 13; num++) {
    ang = num * Math.PI / 6;
    ctx.rotate(ang);
    ctx.translate(0, -radius * 0.85);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius * 0.85);
    ctx.rotate(-ang);
  }
}

function drawTime(ctx, radius) {
  var now = new Date();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();

  hour = hour % 12;
  hour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
  drawHand(ctx, hour, radius * 0.5, radius * 0.07);

  minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
  drawHand(ctx, minute, radius * 0.7, radius * 0.07);

  second = (second * Math.PI / 30);
  drawHand(ctx, second, radius * 0.9, radius * 0.02);
}

function drawWeatherWidget(ctx) {
  var centerX = radius / 3 + 20;
  var iconSize = 128;

  if (!wmoCodes) {
    loadWmoCodes(function () {
      drawWeatherWidget(ctx);
    });
    return;
  }

  var now = new Date();
  var currentQuarter = Math.floor(now.getMinutes() / 15);
  var currentHour = now.getHours();
  var fetchKey = currentHour + ":" + currentQuarter;
  var isDay = (currentHour >= 8 && currentHour < 20) ? "day" : "night";

  if (fetchKey !== lastFetchQuarter) {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=60.4859&longitude=22.1689&daily=temperature_2m_max,uv_index_max,snowfall_sum,rain_sum,weather_code,showers_sum,precipitation_probability_max,precipitation_sum,precipitation_hours,shortwave_radiation_sum,temperature_2m_min&current=temperature_2m,weather_code&forecast_days=1")
      .then(function (response) { return response.json(); })
      .then(function (data) {
        var weatherCode = data.current.weather_code.toString();
        var wmoEntry = wmoCodes[weatherCode] && wmoCodes[weatherCode][isDay];
        if (!wmoEntry) return;

        var iconImg = new Image();
        iconImg.src = wmoEntry.image;
        iconImg.onload = function () {
          cachedWeatherData = data;
          cachedWeatherIcon = iconImg;
          lastFetchQuarter = fetchKey;
          renderWeather(ctx, data, iconImg, centerX, radius, iconSize);
        };
      })
      .catch(function (error) {
        console.log("Weather fetch failed:", error);
        ctx.fillStyle = "red";
        ctx.font = radius * 0.1 + "px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Weather load error", radius / 2, radius);
      });
    return;
  }

  if (cachedWeatherData && cachedWeatherIcon) {
    renderWeather(ctx, cachedWeatherData, cachedWeatherIcon, centerX, radius, iconSize);
  }
}

function renderWeather(ctx, data, iconImg, centerX, radius, iconSize) {
  var temp = data.current.temperature_2m;
  var lowTemp = data.daily.temperature_2m_min[0];
  var highTemp = data.daily.temperature_2m_max[0];
  var uvIndex = data.daily.uv_index_max[0];
  var aqi = 0;
  var rainMm = data.daily.rain_sum[0];
  var snowCm = data.daily.snowfall_sum[0];

  ctx.drawImage(iconImg, centerX - (iconSize / 2), radius - 115, iconSize, iconSize);
  ctx.fillStyle = "black";
  ctx.font = radius * 0.1 + "px Arial";
  ctx.textAlign = "center";

  ctx.fillText(temp.toFixed(1) + "°C (" + lowTemp.toFixed(1) + "-" + highTemp.toFixed(1) + ")", centerX, radius);
  ctx.fillText("\ud83c\udf27 " + rainMm + "mm, \u2744 " + snowCm + "cm", centerX, radius + 35);
  ctx.fillText("\ud83d\ude0e: " + uvIndex, centerX, radius + 70);
  ctx.fillText("\ud83c\udf43: " + aqi, centerX, radius + 105);
}

function loadWmoCodes(callback) {
  fetch("https://underko.github.io/js/wmo_codes.json")
    .then(function (response) { return response.json(); })
    .then(function (json) {
      wmoCodes = json;
      if (callback) callback();
    })
    .catch(function (err) {
      console.log("Failed to load wmo_codes.json", err);
    });
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
