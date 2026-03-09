// Klucz API OpenWeatherMap
const API_KEY = '604d4e6636c27a0ff6cd96d0ce37d409';
const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// Elementy DOM
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');

// Funkcja do wyświetlania komunikatu ładowania
function showLoading() {
    resultsDiv.innerHTML = '<div class="loading">Ładowanie danych pogodowych...</div>';
}

// Funkcja do wyświetlania błędu
function showError(message) {
    resultsDiv.innerHTML = `<div class="error">Błąd: ${message}</div>`;
}

// Funkcja do pobrania bieżącej pogody za pomocą XMLHttpRequest
function getCurrentWeather(city) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = `${CURRENT_WEATHER_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pl`;
        
        xhr.open('GET', url, true);
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    resolve(data);
                } catch (e) {
                    reject('Błąd parsowania danych');
                }
            } else {
                try {
                    const error = JSON.parse(xhr.responseText);
                    reject(error.message || 'Nie udało się pobrać danych');
                } catch (e) {
                    reject('Nie udało się pobrać danych');
                }
            }
        };
        
        xhr.onerror = function() {
            reject('Błąd połączenia z serwerem');
        };
        
        xhr.send();
    });
}

// Funkcja do pobrania prognozy pogody za pomocą Fetch API
async function getForecast(city) {
    try {
        const url = `${FORECAST_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pl`;
        const response = await fetch(url);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Nie udało się pobrać prognozy');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

// Funkcja do formatowania daty
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return date.toLocaleDateString('pl-PL', options);
}

// Funkcja do wyświetlania bieżącej pogody
function displayCurrentWeather(data) {
    return `
        <div class="weather-section">
            <h2>Pogoda bieżąca - ${data.name}, ${data.sys.country}</h2>
            <div class="current-weather">
                <div class="weather-item">
                    <label>Temperatura</label>
                    <value>${Math.round(data.main.temp)}°C</value>
                </div>
                <div class="weather-item">
                    <label>Odczuwalna</label>
                    <value>${Math.round(data.main.feels_like)}°C</value>
                </div>
                <div class="weather-item">
                    <label>Opis</label>
                    <value>${data.weather[0].description}</value>
                </div>
                <div class="weather-item">
                    <label>Wilgotność</label>
                    <value>${data.main.humidity}%</value>
                </div>
                <div class="weather-item">
                    <label>Ciśnienie</label>
                    <value>${data.main.pressure} hPa</value>
                </div>
                <div class="weather-item">
                    <label>Wiatr</label>
                    <value>${Math.round(data.wind.speed * 3.6)} km/h</value>
                </div>
            </div>
        </div>
    `;
}

function displayForecast(data) {
    const forecasts = data.list;
    let forecastHTML = `
        <div class="weather-section">
            <h2>Prognoza 5-dniowa (co 3 godziny)</h2>
    `;

    // Grupowanie po dacie (dzień)
    let currentDay = '';
    forecasts.forEach(forecast => {
        const dateObj = new Date(forecast.dt * 1000);
        const dayLabel = dateObj.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'short' });

        // Jeśli nowy dzień → nagłówek
        if (dayLabel !== currentDay) {
            if (currentDay !== '') {
                forecastHTML += `</div>`; // zamykamy poprzednią grid
            }
            forecastHTML += `<h3>${dayLabel}</h3><div class="forecast-grid">`;
            currentDay = dayLabel;
        }

        forecastHTML += `
            <div class="forecast-item">
                <div class="date">${dateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</div>
                <div class="temp">${Math.round(forecast.main.temp)}°C</div>
                <div class="description">${forecast.weather[0].description}</div>
                <div class="description">💧 ${forecast.main.humidity}%</div>
            </div>
        `;
    });

    forecastHTML += `</div></div>`; // zamykamy ostatni grid + sekcję
    return forecastHTML;
}


// Główna funkcja do pobierania i wyświetlania pogody
async function fetchWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Proszę wprowadzić nazwę miasta');
        return;
    }
    
    showLoading();
    
    try {
        // Pobieramy bieżącą pogodę za pomocą XMLHttpRequest
        console.log('Pobieranie bieżącej pogody za pomocą XMLHttpRequest...');
        const currentWeather = await getCurrentWeather(city);
        console.log('Odpowiedź bieżącej pogody:', currentWeather); 

        // Pobieramy prognozę za pomocą Fetch API
        console.log('Pobieranie prognozy za pomocą Fetch API...');
        const forecast = await getForecast(city);
        console.log('Odpowiedź prognozy:', forecast); 

        const currentWeatherHTML = displayCurrentWeather(currentWeather);
        const forecastHTML = displayForecast(forecast);
        
        resultsDiv.innerHTML = currentWeatherHTML + forecastHTML;
        
    } catch (error) {
        console.error('Błąd:', error);
        showError(error.message || error);
    }
}


// Obsługa kliknięcia przycisku
searchBtn.addEventListener('click', fetchWeather);

// Obsługa naciśnięcia Enter w polu tekstowym
cityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        fetchWeather();
    }
});
