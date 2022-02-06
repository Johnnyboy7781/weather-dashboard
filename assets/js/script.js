const searchFormEl = document.querySelector("form");
const searchInputEl = document.querySelector(".form-input");
const infoGeneralEl = document.querySelector(".info-general");
const info5DayEl = document.querySelector(".info-5-day");
const prevSearchListEl = document.querySelector(".prev-search-list");
const apiKey = "941125bb6927b198d0351a7463f13a4a";

const populateForecastArea = weatherData => {
    info5DayEl.innerHTML = "";

    let titleEl = document.createElement("h3");
    titleEl.textContent = "5-Day Forecast:";
    info5DayEl.append(titleEl);

    let forecasteContainerEl = document.createElement("div");
    forecasteContainerEl.className = "forecast-container";

    for (let i = 0; i < 5; i++) {
        let dayEl = document.createElement("div");
        dayEl.className = "day";

        let dayDateEl = document.createElement("h4");
        dayDateEl.textContent = convertDate(weatherData.daily[i].dt * 1000);
        dayEl.append(dayDateEl);

        console.log(weatherData.daily[i].weather.icon);
        let iconEl = document.createElement("img");
        iconEl.setAttribute("src", "http://openweathermap.org/img/wn/" + weatherData.daily[i].weather[0].icon + "@2x.png");
        dayEl.append(iconEl);

        let tempEl = document.createElement("p");
        tempEl.textContent = "Temp: " + weatherData.daily[i].temp.max + "F";
        dayEl.append(tempEl);

        let windEl = document.createElement("p");
        windEl.textContent = "Wind: " + weatherData.daily[i].wind_speed + " MPH";
        dayEl.append(windEl);

        let humidityEl = document.createElement("p");
        humidityEl.textContent = "Humidity: " + weatherData.daily[i].humidity + "%";
        dayEl.append(humidityEl);

        forecasteContainerEl.append(dayEl);
    }

    info5DayEl.append(forecasteContainerEl);
}

const populateInfoArea = (weatherData, cityName) => {
    infoGeneralEl.innerHTML = "";

    let cityNameEl = document.createElement("h2");
    cityNameEl.textContent = cityName + " " + convertDate();
    infoGeneralEl.append(cityNameEl);

    let tempEl = document.createElement("p");
    tempEl.textContent = "Temp: " + weatherData.current.temp + "F";
    infoGeneralEl.append(tempEl);

    let windEl = document.createElement("p");
    windEl.textContent = "Wind: " + weatherData.current.wind_speed + " MPH";
    infoGeneralEl.append(windEl);

    let humidityEl = document.createElement("p");
    humidityEl.textContent = "Humidity: " + weatherData.current.humidity + "%";
    infoGeneralEl.append(humidityEl);

    let uvEl = document.createElement("p");
    let uvSpanEl = document.createElement("span");
    uvEl.textContent = "UV Index: ";
    uvSpanEl.className = "uv";
    uvSpanEl.textContent = weatherData.current.uvi;
    uvEl.append(uvSpanEl);
    infoGeneralEl.append(uvEl);

    populateForecastArea(weatherData);
}

const convertDate = (date = "") => {
    let dateObj;
    if (date) {
        dateObj = new Date(date);
    } else {
        dateObj = new Date();
    }

    var dd = String(dateObj.getDate()).padStart(2, '0');
    var mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    var yyyy = dateObj.getFullYear();
    dateObj = mm + '/' + dd + '/' + yyyy;

    return dateObj
}

const getWeatherData = (lat, lon, cityName) => {
    apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey + "&units=imperial&exclude=minutely,hourly";
    fetch(apiUrl).then(response => {
        if (response.ok) {
            response.json().then(data => {
                console.log(data);
                populateInfoArea(data, cityName);
            });
        }
    })
}

const formatCityName = cityName => {
    let formattedCityName = cityName.toLowerCase();
    let nameArr = formattedCityName.split(" ");
    formattedCityName = "";
    for (let i = 0; i < nameArr.length; i++) {
        nameArr[i] = nameArr[i][0].toUpperCase() + nameArr[i].substring(1);
        formattedCityName += nameArr[i] + " ";
    }
    formattedCityName.trim();
    return formattedCityName;
}

const createNewPrevCity = cityName => {
    let prevCityEl = document.createElement("div");
    prevCityEl.className = "prev-city";
    prevCityEl.innerHTML = formatCityName(cityName);
    prevSearchListEl.append(prevCityEl);
}

const loadCities = () => {
    let savedCities = JSON.parse(localStorage.getItem("cities"));

    if (!savedCities) return;

    for (let i = 0; i < savedCities.length; i++) {
        createNewPrevCity(savedCities[i]);
    }
}

const saveCity = cityName => {
    let savedCities = JSON.parse(localStorage.getItem("cities"));
    
    if (!savedCities) {
        savedCities = [];
    } else if (savedCities.includes(cityName)) {
        return;
    }

    createNewPrevCity(cityName);
    
    savedCities.push(cityName);

    localStorage.setItem("cities", JSON.stringify(savedCities));
}

const formSubmitHandler = event => {
    event.preventDefault();
    let input = searchInputEl.value.trim();

    if (!input) {
        alert("Please enter a valid city name!");
        return;
    }

    apiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + input + "&limit=1&appid=" + apiKey;
    fetch(apiUrl).then(response => {
        if (response.ok) {
            response.json().then(data => {
                if (!data[0]) {
                    alert("Not a valid city name, please try again!");
                    return;
                }

                saveCity(input);
                let lat = data[0].lat;
                let lon = data[0].lon;
                getWeatherData(lat, lon, input);
            })
        } else {
            alert("There was an issue with your request, please try again later")
        }
    })
}

loadCities();
searchFormEl.addEventListener("submit", formSubmitHandler);