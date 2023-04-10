let latitude, longitude;
let useDeviceLocation = false;
let searchRadius = 5000;
const API_KEY = "AIzaSyC5HQn8c8qbJpBW19cHzg4xmNpzXAVfGqQ";

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
  useDeviceLocation = true;

  const robotMessage = document.getElementById("robot-message");
  robotMessage.innerHTML = "Great, we have your location! Let's find you some great travel options.";

  const searchButton = document.getElementById("search-button");
  searchButton.style.display = "block";
}

function showError(error) {
  console.log(error);
  const robotMessage = document.getElementById("robot-message");
  robotMessage.innerHTML = "We couldn't detect your location. Please use the search bar to find travel options.";

  const locationButton = document.getElementById("location-button");
  locationButton.style.display = "block";
}

function useDefaultLocation() {
  latitude = 37.7749;
  longitude = -122.4194;
  useDeviceLocation = false;

  const robotMessage = document.getElementById("robot-message");
  robotMessage.innerHTML = "No problem, let's find you some great travel options.";

  const searchButton = document.getElementById("search-button");
  searchButton.style.display = "block";
}

function searchLocations() {
  const locationInput = document.getElementById("location-input");
  const location = locationInput.value;

  if (location) {
    const url = `https://api.opentripmap.com/0.1/en/places/geoname?name=${location}&apikey=${API_KEY}`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const firstResult = data.features[0];
        if (firstResult) {
          const resultLatitude = firstResult.geometry.coordinates[1];
          const resultLongitude = firstResult.geometry.coordinates[0];
          const resultName = firstResult.properties.name;

          const locationMessage = document.getElementById("location-message");
          locationMessage.innerHTML = `How about ${resultName}?`;

          const locationButton = document.getElementById("location-button");
          locationButton.style.display = "block";

          const radiusInput = document.getElementById("radius-input");
          const radius = parseInt(radiusInput.value);
          if (!isNaN(radius) && radius > searchRadius) {
            searchRadius = radius;
          }

          if (useDeviceLocation) {
            const distance = getDistanceFromLatLonInKm(latitude, longitude, resultLatitude, resultLongitude);
            if (distance > searchRadius / 1000) {
              const robotMessage = document.getElementById("robot-message");
              robotMessage.innerHTML = `That location is ${distance.toFixed(1)} km away from you. Let's search for options within ${searchRadius / 1000} km.`;
              return searchNearby(resultLatitude, resultLongitude, searchRadius);
            }
          }

          const robotMessage = document.getElementById("robot-message");
          robotMessage.innerHTML = `Great choice! Let's see what else is around there.`;
          return searchNearby(resultLatitude, resultLongitude, searchRadius);
        } else {
          const locationMessage = document.getElementById("location-message");
          locationMessage.innerHTML = `Sorry, we couldn't find a location matching "${location}".`;

          const suggestButton = document.getElementById("suggest-button");
          suggestButton.style.display = "block";
        }
      })
      .catch(error => console.log(error)); // added closing bracket for catch
  }
}
