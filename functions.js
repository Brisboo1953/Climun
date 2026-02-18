const apiKey = "c3cdda0cf54c2444c3d5139ec10a1569";

const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const weatherSection = document.getElementById("weatherSection");
const recommendationsSection = document.getElementById("recommendationsSection");
const favoriteBtn = document.getElementById("favoriteBtn");
const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");

let failCount = 0;
let circuitOpen = false;
let maxFailures = 3;

let currentCityData = null;
let currentCity = null;
let currentTemp = null;
let currentWeather = null;

form.addEventListener("submit", function (e) {
    e.preventDefault();
    const city = cityInput.value.trim();

    if (city === "") {
        alert("Ingresa una ciudad válida");
        return;
    }

    getWeather(city);
});

async function getWeather(city) {

    if (circuitOpen) {
        alert("Servicio temporalmente no disponible. Intenta en unos segundos.");
        return;
    }

    let attempts = 0;
    let success = false;

    while (attempts < 3 && !success) {

        try {

            const url = "https://api.openweathermap.org/data/2.5/weather?q=" 
            + city 
            + "&appid=" + apiKey 
            + "&units=metric&lang=es";

            const response = await fetch(url);
            const data = await response.json();

            if (data.cod != 200) {
                throw new Error("Error en API");
            }

            success = true;
            failCount = 0;

            currentCityData = data;
            currentCity = data.name;
            currentTemp = data.main.temp;
            currentWeather = data.weather[0].main;

            document.getElementById("cityName").textContent = currentCity;
            document.getElementById("temperature").textContent = "🌡 " + currentTemp + "°C";
            document.getElementById("description").textContent = data.weather[0].description;
            document.getElementById("weatherIcon").src =
                "https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";

            weatherSection.classList.remove("hidden");

            changeHeaderColor(currentWeather);
            generateRecommendations(currentWeather);
            getForecast(city);

        } catch (error) {

            attempts++;
            failCount++;

            console.log("Intento fallido:", attempts);

            if (attempts >= 3) {
                alert("No se pudo obtener el clima.");
            }

            if (failCount >= maxFailures) {
                openCircuit();
            }
        }
    }
}

function generateRecommendations(weather) {

    const list = document.getElementById("recommendationsList");
    list.innerHTML = "";

    const recommendationsByWeather = {
        Clear: [
            "🏖 Ir a la playa",
            "🚴 Paseo en bicicleta",
            "🌄 Hacer senderismo",
            "🕶 Usar gafas de sol y salir",
            "🏞 Picnic al aire libre",
            "📸 Sesión de fotos al sol"
        ],
        Rain: [
            "☕ Ir a una cafetería",
            "🎬 Ver una película",
            "📚 Leer un libro",
            "🎨 Dibujar o pintar",
            "🛍 Ir de compras",
            "🍿 Maratón de series"
        ],
        Clouds: [
            "🌆 Tour por la ciudad",
            "📸 Fotografía urbana",
            "🚶 Caminata ligera",
            "🎧 Escuchar música relajante",
            "🖼 Visitar una galería"
        ],
        Snow: [
            "⛄ Hacer un muñeco de nieve",
            "☕ Tomar chocolate caliente",
            "🧣 Usar ropa abrigadora",
            "🎿 Actividades en la nieve"
        ],
        Thunderstorm: [
            "🏠 Quedarse en casa",
            "🎮 Jugar videojuegos",
            "🎵 Escuchar música relajante",
            "📺 Ver documentales"
        ]
    };

    const allRecommendations = recommendationsByWeather[weather] || [
        "🎒 Explorar atracciones locales",
        "📍 Descubrir nuevos lugares",
        "📷 Tomar fotografías"
    ];

    const shuffled = allRecommendations.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    selected.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    });

    recommendationsSection.classList.remove("hidden");
}

function changeHeaderColor(weather) {

    const header = document.querySelector("header");

    if (weather === "Clear") {
        header.style.background = "linear-gradient(to right, #f6d365, #fda085)";
    } 
    else if (weather === "Rain") {
        header.style.background = "linear-gradient(to right, #4e73df, #224abe)";
    } 
    else if (weather === "Clouds") {
        header.style.background = "linear-gradient(to right, #bdc3c7, #2c3e50)";
    } 
    else if (weather === "Snow") {
        header.style.background = "linear-gradient(to right, #e6dada, #274046)";
    } 
    else if (weather === "Thunderstorm") {
        header.style.background = "linear-gradient(to right, #232526, #414345)";
    } 
    else {
        header.style.background = "linear-gradient(to right, #6a11cb, #2575fc)";
    }
}

favoriteBtn.addEventListener("click", function () {

    if (!currentCity) return;

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    const cityObject = {
        name: currentCity,
        temp: currentTemp
    };

    let exists = false;

    for (let i = 0; i < favorites.length; i++) {
        if (favorites[i].name === cityObject.name) {
            exists = true;
        }
    }

    if (!exists) {
        favorites.push(cityObject);
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }

    loadFavorites();
});

function loadFavorites() {

    const list = document.getElementById("favoritesList");
    list.innerHTML = "";

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    favorites.forEach(city => {
        const li = document.createElement("li");
        li.textContent = "⭐ " + city.name + " - " + city.temp + "°C";
        list.appendChild(li);
    });
}

clearFavoritesBtn.addEventListener("click", function () {
    localStorage.removeItem("favorites");
    loadFavorites();
});

window.onload = loadFavorites;

function openCircuit() {

    circuitOpen = true;

    console.log("Circuito abierto");

    setTimeout(function () {
        circuitOpen = false;
        failCount = 0;
        console.log("Circuito cerrado");
    }, 10000);
}

async function getForecast(city) {

    try {

        const url = "https://api.openweathermap.org/data/2.5/forecast?q=" 
        + city 
        + "&appid=" + apiKey 
        + "&units=metric&lang=es";

        const response = await fetch(url);
        const data = await response.json();

        if (data.cod != 200) {
            throw new Error("Error en pronóstico");
        }

        const container = document.getElementById("forecastContainer");
        container.innerHTML = "";

        for (let i = 0; i < data.list.length; i += 8) {

            const dayData = data.list[i];

            const date = new Date(dayData.dt_txt);
            const dayName = date.toLocaleDateString("es-ES", { weekday: "long" });

            const div = document.createElement("div");
            div.classList.add("forecast-card");

            div.innerHTML =
                "<p><strong>" + dayName + "</strong></p>" +
                "<img src='https://openweathermap.org/img/wn/" 
                + dayData.weather[0].icon 
                + "@2x.png'>" +
                "<p>" + dayData.main.temp + "°C</p>" +
                "<p>" + dayData.weather[0].description + "</p>";

            container.appendChild(div);
        }

        document.getElementById("forecastSection").classList.remove("hidden");

    } catch (error) {
        console.log("Error al obtener pronóstico");
    }
}
