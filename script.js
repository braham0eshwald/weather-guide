const API_KEY = "f00413171246eb790e8aadbe1be10878";
const dateSelect = document.getElementById("date");
const timeSelect = document.getElementById("time");
let forecastData = null;

document
  .querySelector(".search-box button")
  .addEventListener("click", function () {
    const city = document.getElementById("search-btn").value.trim();
    if (!city) {
      alert("Введите название города!");
      return;
    }
    fetchCurrentWeather(city);
  });

function fetchCurrentWeather(city) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ru`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.cod === "404") {
        document.querySelector(".container").style.height = "450px";
        document.querySelector(".weather-box").classList.remove("active");
        document.querySelector(".forecast-box").classList.remove("active");
        document.querySelector(".not-found").classList.add("active");
        return;
      }

      const temp = Math.round(data.main.temp);
      const description = data.weather[0].description;
      document.getElementById("current-temp").textContent = `${temp}°C`;
      document.getElementById("current-desc").textContent = description;
      document.getElementById("current-guide").textContent = getWeatherGuide(
        temp,
        description
      );

      document.querySelector(".container").style.height = "560px";
      document.querySelector(".weather-box").classList.add("active");
      document.querySelector(".forecast-box").classList.add("active");
      document.querySelector(".not-found").classList.remove("active");

      fetchForecast(city);
    })
    .catch((error) => console.error("Ошибка:", error));
}

function fetchForecast(city) {
  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=ru`
  )
    .then((response) => response.json())
    .then((data) => {
      forecastData = data.list;
      populateDateAndTimeOptions(forecastData);
    })
    .catch((error) => console.error("Ошибка получения прогноза:", error));
}

function populateDateAndTimeOptions(data) {
  const timesByDay = {};
  data.forEach((item) => {
    const forecastDate = new Date(item.dt * 1000);
    const dateKey = forecastDate.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
    });
    const timeKey = forecastDate.toTimeString().slice(0, 5);

    if (!timesByDay[dateKey]) {
      timesByDay[dateKey] = new Set();
    }
    timesByDay[dateKey].add(timeKey);
  });

  dateSelect.innerHTML = "";
  timeSelect.innerHTML = "";

  Object.keys(timesByDay).forEach((date) => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = date;
    dateSelect.appendChild(option);
  });

  dateSelect.dispatchEvent(new Event("change"));
}

dateSelect.addEventListener("change", () => {
  const selectedDate = dateSelect.value;
  timeSelect.innerHTML = "";

  const times = Array.from(
    new Set(
      forecastData
        .map((item) => {
          const forecastDate = new Date(item.dt * 1000);
          const dateKey = forecastDate.toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
          });
          return dateKey === selectedDate
            ? forecastDate.toTimeString().slice(0, 5)
            : null;
        })
        .filter(Boolean)
    )
  );

  times.forEach((time) => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time;
    timeSelect.appendChild(option);
  });
});

timeSelect.addEventListener("change", () => {
  const selectedDate = dateSelect.value;
  const selectedTime = timeSelect.value;
  updateForecast(selectedDate, selectedTime);
});

function updateForecast(selectedDate, selectedTime) {
  const forecastItem = forecastData.find((item) => {
    const forecastDate = new Date(item.dt * 1000);
    const dateKey = forecastDate.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
    });
    const timeKey = forecastDate.toTimeString().slice(0, 5);
    return dateKey === selectedDate && timeKey === selectedTime;
  });

  if (!forecastItem) {
    alert("Прогноз для выбранного времени недоступен!");
    return;
  }

  const temp = Math.round(forecastItem.main.temp);
  const description = forecastItem.weather[0].description;
  document.getElementById("forecast-temp").textContent = `${temp}°C`;
  document.getElementById("forecast-desc").textContent = description;
  document.getElementById("forecast-guide").textContent = getWeatherGuide(
    temp,
    description
  );
}

function getWeatherGuide(temp, description) {
  if (temp < 0) {
    return "Очень холодно! Лучше оставаться дома.";
  } else if (temp >= 0 && temp < 10) {
    return "Холодно. Одевайтесь теплее!";
  } else if (temp >= 10 && temp < 20) {
    return "Прохладно. Возьмите легкую куртку.";
  } else if (temp >= 20 && temp < 30) {
    return "Идеальная погода для прогулок!";
  } else {
    return "Жарко! Пейте больше воды.";
  }
}
