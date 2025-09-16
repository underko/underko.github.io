var clock, ctx, radius;
var lastFetchQuarter = null;
var cachedWeatherData = null;
var cachedWeatherIcon = null;
var wmoCodes = null;

function initClockCanvas() {
  clock = document.getElementById("clock");
  resizeClockCanvas();
  ctx = clock.getContext("2d");
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  drawClock();
  setInterval(drawClock, 1000);
  window.addEventListener("resize", resizeClockCanvas);
}

function resizeClockCanvas() {
  clock.height = window.innerHeight * 0.8;
  clock.width = window.innerWidth;
  radius = (clock.height / 2) * 0.90;
}

function drawClock() {
  clearCanvas();
  renderDigital();
  renderWeather();
  renderDate();
  renderWeekDays();

  ctx.save();
  ctx.translate(clock.width / 2, clock.height / 2);
  drawFace();
  drawNumbers();
  drawTime();
  ctx.restore();
}

function clearCanvas() {
  ctx.fillStyle = "antiquewhite";
  ctx.fillRect(0, 0, clock.width, clock.height);
}

function renderWeekDays() {
  var date = new Date();
  var daysSvk = ["PONDELOK","UTOROK","STREDA","ŠTVRTOK","PIATOK","SOBOTA","NEDELA"];
  var daysFin = ["MAANANTAI","TIISTAI","KESKIVIIKKO","TORSTAI","PERJANTAI","LAUANTAI","SUNNUNTAI"];
  var daysColors = ["green","blue","white","brown","yellow","pink","red"];

  ctx.font = (radius * 0.1) + "px arial";
  ctx.textAlign = "left";

  for (var i = 0; i < 7; i++) {
    var y = window.innerHeight * 0.1 + i * 80;
    var isToday = ((date.getDay() || 7) === i + 1);

    if (isToday) {
      ctx.fillStyle = "black";
      ctx.fillRect(clock.width - 205, y - 30, 200, 85);
      ctx.fillStyle = "antiquewhite";
      ctx.fillRect(clock.width - 203, y - 28, 196, 81);
    }

    ctx.fillStyle = daysColors[i];
    ctx.fillText(daysSvk[i], clock.width - 200, y);
    ctx.fillText(daysFin[i], clock.width - 200, y + 30);
  }
}

function renderDigital() {
  var date = new Date();
  var h = pad2(date.getHours());
  var m = pad2(date.getMinutes());
  var time = h + ":" + m;

  ctx.fillStyle = "black";
  ctx.font = (radius * 0.4) + "px arial";
  ctx.textAlign = "center";
  ctx.fillText(time, radius / 2, radius / 3);
}

function renderDate() {
  var dateObj = new Date();
  var d = pad2(dateObj.getDate());
  var m = pad2(dateObj.getMonth() + 1);
  var dateStr = d + "." + m + ".";

  ctx.fillStyle = "black";
  ctx.font = (radius * 0.4) + "px arial";
  ctx.textAlign = "center";
  ctx.fillText(dateStr, radius / 2 + 20, clock.height - radius * 0.2);
}

// ----------------- Analog Clock -----------------
function drawFace() {
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "white";
  ctx.fill();

  var grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
  grad.addColorStop(0, "#333");
  grad.addColorStop(1, "#333");
  ctx.strokeStyle = grad;
  ctx.lineWidth = radius * 0.05;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.05, 0, 2 * Math.PI);
  ctx.fillStyle = "#333";
  ctx.fill();
}

function drawNumbers() {
  ctx.fillStyle = "black";
  ctx.font = (radius * 0.15) + "px arial";
  ctx.textAlign = "center";

  for (var num = 1; num <= 12; num++) {
    var ang = num * Math.PI / 6;
    ctx.rotate(ang);
    ctx.translate(0, -radius * 0.85);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius * 0.85);
    ctx.rotate(-ang);
  }
}

function drawTime() {
  var now = new Date();
  var hour = now.getHours() % 12;
  var minute = now.getMinutes();
  var second = now.getSeconds();

  var hourPos = (hour * Math.PI / 6) +
                (minute * Math.PI / (6 * 60)) +
                (second * Math.PI / (360 * 60));
  var minutePos = (minute * Math.PI / 30) +
                  (second * Math.PI / (30 * 60));
  var secondPos = second * Math.PI / 30;

  drawHand(hourPos, radius * 0.5, radius * 0.07);
  drawHand(minutePos, radius * 0.7, radius * 0.07);
  drawHand(secondPos, radius * 0.9, radius * 0.02);
}

function drawHand(pos, length, width) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.moveTo(0, 0);
  ctx.rotate(pos);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.rotate(-pos);
}

function renderWeather() {
  var centerX = radius / 3 + 20;
  var iconSize = 128;

  if (!wmoCodes) {
    loadWmoCodes(function () {
      renderWeather();
    });
    return;
  }

  var now = new Date();
  var currentQuarter = Math.floor(now.getMinutes() / 15);
  var currentHour = now.getHours();
  var fetchKey = currentHour + ":" + currentQuarter;
  var isDay = (currentHour >= 8 && currentHour < 20) ? "day" : "night";

  if (fetchKey !== lastFetchQuarter) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.open-meteo.com/v1/forecast?latitude=60.4859&longitude=22.1689&daily=temperature_2m_max,uv_index_max,snowfall_sum,rain_sum,weather_code,showers_sum,precipitation_probability_max,precipitation_sum,precipitation_hours,shortwave_radiation_sum,temperature_2m_min&current=temperature_2m,weather_code&forecast_days=1", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        var weatherCode = data.current.weather_code.toString();
        var wmoEntry = wmoCodes[weatherCode] && wmoCodes[weatherCode][isDay];
        if (!wmoEntry) return;

        var iconImg = new Image();
        iconImg.src = wmoEntry.image;
        iconImg.onload = function () {
          cachedWeatherData = data;
          cachedWeatherIcon = iconImg;
          lastFetchQuarter = fetchKey;
          drawWeatherData(data, iconImg, centerX, iconSize);
        };
      } else if (xhr.readyState === 4) {
        ctx.fillStyle = "red";
        ctx.font = (radius * 0.1) + "px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Weather load error", radius / 2, radius);
      }
    };
    xhr.send();
    return;
  }

  if (cachedWeatherData && cachedWeatherIcon) {
    drawWeatherData(cachedWeatherData, cachedWeatherIcon, centerX, iconSize);
  }
}

function drawWeatherData(data, iconImg, centerX, iconSize) {
  var temp = data.current.temperature_2m;
  var lowTemp = data.daily.temperature_2m_min[0];
  var highTemp = data.daily.temperature_2m_max[0];
  var uvIndex = data.daily.uv_index_max[0];
  var rainMm = data.daily.rain_sum[0];
  var snowCm = data.daily.snowfall_sum[0];

  ctx.drawImage(iconImg, centerX - iconSize / 2, radius - 115, iconSize, iconSize);
  ctx.fillStyle = "black";
  ctx.font = (radius * 0.1) + "px Arial";
  ctx.textAlign = "center";

  ctx.fillText(temp.toFixed(1) + "°C", centerX, radius + 30);
  ctx.fillText(lowTemp.toFixed(1) + "°C - " + highTemp.toFixed(1) + "°C", centerX, radius + 70);
  ctx.fillText("\ud83c\udf27 " + rainMm + "mm, \u2744 " + snowCm + "cm", centerX, radius + 110);
  ctx.fillText("\ud83d\ude0e: " + uvIndex, centerX, radius + 150);
}

function loadWmoCodes(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://underko.github.io/js/wmo_codes.json", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      wmoCodes = JSON.parse(xhr.responseText);
      if (callback) callback();
    }
  };
  xhr.send();
}

function pad2(n) {
  return (n < 10 ? "0" : "") + n;
}

initClockCanvas();
