import Network from "./network.mjs";
import { Errors } from "./errors.mjs";
import { UNITS } from "./weather-data.mjs";
const appState = {
  citySearchRequestInProgress: false,
  weatherRequestInProgress: false,
  searchResults: [],
  unitSystem: UNITS.metric,
  temperatureUnit: { unit: "C", system: UNITS.metric },
  windSpeedUnit: { unit: "km/h", system: UNITS.metric },
  precipitationUnit: { unit: "mm", system: UNITS.metric },
  currentDayIndexInHourlyView: null,
  currentLocation: {
    longitude: null,
    latitude: null,
    locationName: null,
  },
  weatherData: {
    metric: null,
    imperial: null,
  },
};

const elementsToBeUpdated = {
  header: {
    sysToggleItem: document.querySelector(".header .dropdown .switch-to"),
    dropdown: document.querySelector(".header .dropdown"),
    metricItems: document.querySelectorAll(
      ".header .dropdown .dropdown-item-metric"
    ),
    imperialItems: document.querySelectorAll(
      ".header .dropdown .dropdown-item-imperial"
    ),
    tempItems: document.querySelectorAll(
      ".header .dropdown .dropdown-item-temp"
    ),
    windSpeedItems: document.querySelectorAll(
      ".header .dropdown .dropdown-item-wind"
    ),
    precipItems: document.querySelectorAll(
      ".header .dropdown .dropdown-item-precip"
    ),
  },
  search: {
    input: document.querySelector(".search input[type='search']"),
    dropdown: document.querySelector(".search-dropdown"),
    loader: document.querySelector(".search-dropdown .loader"),
  },
  current: {
    backgroundImage: document.querySelector(".now-bg"),
    nowMainContainer: document.querySelector(".now-main-container"),
    loader: document.querySelector(".now-main .loader"),
    temperature: document.querySelector(".now-main .temp"),
    weatherIcon: document.querySelector(".now-main .icon"),
    date: document.querySelector(".now-main .date"),
    location: document.querySelector(".now-main .location"),
    apparentTemperature: document.querySelector(".feels-like-info .info-value"),
    humidity: document.querySelector(".humidity-info .info-value"),
    windSpeed: document.querySelector(".wind-speed-info .info-value"),
    precipitation: document.querySelector(".precipitation-info .info-value"),
  },
  daily: {
    dayItems: [
      ...document.querySelectorAll(".daily-info-container .forecast-item"),
    ].map((item) => {
      return {
        day: item.querySelector(".day"),
        weatherIcon: item.querySelector(".icon"),
        hTemp: item.querySelector(".h-temp"),
        lTemp: item.querySelector(".l-temp"),
      };
    }),
  },
  hourly: {
    dayDropdownTrigger: document.querySelector(
      ".hourly-forecast .dropdown-trigger"
    ),
    dayDropdown: document.querySelector(".hourly-forecast .hourly-dropdown"),
    dropdownItems: [
      ...document.querySelectorAll(
        ".hourly-forecast .hourly-dropdown .dropdown-item"
      ),
    ],
    hoursItems: [
      ...document.querySelectorAll(".hours-list .hour-info-item"),
    ].map((item) => {
      return {
        hour: item.querySelector(".hour"),
        weatherIcon: item.querySelector(".icon"),
        temp: item.querySelector(".temp"),
      };
    }),
  },
};
const stateHandler = {
  set(target, property, value) {
    target[property] = value;
    switch (property) {
      case "currentDayIndexInHourlyView":
        updateHourly();
        break;

      case "weatherData":
        updatePage();
        break;
      case "unitSystem":
        updateUnitsDropdown("all");
        updatePage();
        break;
      case "unitSystemDoNothing":
        appState.unitSystem = value;
        break;
      case "temperatureUnit":
       appStateProxy.temperatureUnit.system === appStateProxy.windSpeedUnit.system && appStateProxy.temperatureUnit.system === appStateProxy.precipitationUnit.system
        if(appStateProxy.temperatureUnit.system === appStateProxy.windSpeedUnit.system && appStateProxy.temperatureUnit.system === appStateProxy.precipitationUnit.system){
          appStateProxy.unitSystemDoNothing = appStateProxy.temperatureUnit.system;
        }
        updateUnitsDropdown("temp");
        updatePage();
        break;
      case "windSpeedUnit":
                if(appStateProxy.temperatureUnit.system === appStateProxy.windSpeedUnit.system && appStateProxy.temperatureUnit.system === appStateProxy.precipitationUnit.system){
          appStateProxy.unitSystemDoNothing = appStateProxy.temperatureUnit.system;
        }
        updateUnitsDropdown("wind");
        updatePage();
        break;
      case "precipitationUnit":
                if(appStateProxy.temperatureUnit.system === appStateProxy.windSpeedUnit.system && appStateProxy.temperatureUnit.system === appStateProxy.precipitationUnit.system){
          appStateProxy.unitSystemDoNothing = appStateProxy.temperatureUnit.system;
        }
        updateUnitsDropdown("precip");
        updatePage();
        break;
      case "citySearchRequestInProgress":
        if (value) {
          elementsToBeUpdated.search.loader.classList.remove("hidden");
          elementsToBeUpdated.search.dropdown.classList.add("loading");
          elementsToBeUpdated.search.dropdown.classList.remove("hidden");
          elementsToBeUpdated.search.dropdown
            .querySelectorAll(".dropdown-item")
            .forEach((item) => {
              item.remove();
            });
        } else {
          elementsToBeUpdated.search.dropdown.classList.remove("loading");
          elementsToBeUpdated.search.loader.classList.add("hidden");
        }
        break;
      case "searchResults":
        updateSearchResultsDropdown();
        break;
      case "weatherRequestInProgress":
        if (value) {
          clearUi();
          elementsToBeUpdated.current.nowMainContainer.classList.add("loading");
          elementsToBeUpdated.current.loader.classList.remove("hidden");
        } else {
          elementsToBeUpdated.current.loader.classList.add("hidden");
          elementsToBeUpdated.current.nowMainContainer.classList.remove("loading");
        }
        break;
    }

    return true;
  },
  get(target, property) {
    return target[property];
  },
};
const appStateProxy = new Proxy(appState, stateHandler);
initializePage();

function weatherRequest() {
  Network.weatherRequest(
    appState.currentLocation.longitude,
    appState.currentLocation.latitude
  )
    .then((data) => {
      appStateProxy.weatherRequestInProgress = false;
      appStateProxy.weatherData = data;
    })
    .catch(() => {
      appStateProxy.weatherRequestInProgress = false;
      Errors.weatherRequestFailed();
    });
}
function initializePage() {
  hideDropdowns();
  initializeHeader();
  renderSearch();
  initializeHourly();
}
function updatePage() {
  try {
    updateMain();
    updateDaily();
    updateHourly();
  } catch (error) {
    console.error("Error updating the page:", error);
    clearUi();
  }
}

function initializeHeader() {
  const dropdown = document.querySelector(".header .dropdown");
  const dropdownTrigger = document.querySelector(".header .dropdown-trigger");
  dropdownTrigger.addEventListener("click", () => {
    dropdown.classList.toggle("hidden");
  });

  const cEl = document.querySelector(".header .dropdown-item-c");
  const fEl = document.querySelector(".header .dropdown-item-f");
  const kmhEl = document.querySelector(".header .dropdown-item-kmh");
  const mphEl = document.querySelector(".header .dropdown-item-mph");
  const mmEl = document.querySelector(".header .dropdown-item-mm");
  const inEl = document.querySelector(".header .dropdown-item-in");
  cEl.addEventListener("click", () => {
    if (appStateProxy.temperatureUnit.system === UNITS.metric) return;
    appStateProxy.temperatureUnit = { unit: "C", system: UNITS.metric };
  });
  fEl.addEventListener("click", () => {
    if (appStateProxy.temperatureUnit.system === UNITS.imperial) return;
    appStateProxy.temperatureUnit = { unit: "F", system: UNITS.imperial };
  });
  kmhEl.addEventListener("click", () => {
    if (appStateProxy.windSpeedUnit.system === UNITS.metric) return;
    appStateProxy.windSpeedUnit = { unit: "km/h", system: UNITS.metric };
  });
  mphEl.addEventListener("click", () => {
    if (appStateProxy.windSpeedUnit.system === UNITS.imperial) return;
    appStateProxy.windSpeedUnit = { unit: "mph", system: UNITS.imperial };
  });
  mmEl.addEventListener("click", () => {
    if (appStateProxy.precipitationUnit.system === UNITS.metric) return;
    appStateProxy.precipitationUnit = { unit: "mm", system: UNITS.metric };
  });
  inEl.addEventListener("click", () => {
    if (appStateProxy.precipitationUnit.system === UNITS.imperial) return;
    appStateProxy.precipitationUnit = { unit: "in", system: UNITS.imperial };
  });

  const sysToggle = elementsToBeUpdated.header.sysToggleItem;
  sysToggle.addEventListener("click", () => {
    if (appStateProxy.unitSystem === UNITS.metric) {
      appStateProxy.temperatureUnit.system = UNITS.imperial;
      appStateProxy.windSpeedUnit.system = UNITS.imperial;
      appStateProxy.precipitationUnit.system = UNITS.imperial;
      appStateProxy.temperatureUnit.unit = "F";
      appStateProxy.windSpeedUnit.unit = "mph";
      appStateProxy.precipitationUnit.unit = "in";
      appStateProxy.unitSystem = UNITS.imperial;
    } else {
      appStateProxy.temperatureUnit.system = UNITS.metric;
      appStateProxy.windSpeedUnit.system = UNITS.metric;
      appStateProxy.precipitationUnit.system = UNITS.metric;
      appStateProxy.temperatureUnit.unit = "C";
      appStateProxy.windSpeedUnit.unit = "km/h";
      appStateProxy.precipitationUnit.unit = "mm";
      appStateProxy.unitSystem = UNITS.metric;
    }
  });
}
function updateUnitsDropdown(whatToUpdate) {
  switch (whatToUpdate) {
    case "all":
      if (appStateProxy.unitSystem === UNITS.imperial) {
        elementsToBeUpdated.header.sysToggleItem.textContent =
          "Switch to Metric";
        elementsToBeUpdated.header.imperialItems.forEach((item) => {
          item.classList.add("selected");
          item.querySelector(".tick").classList.remove("transparent");
        });
        elementsToBeUpdated.header.metricItems.forEach((item) => {
          item.classList.remove("selected");
          item.querySelector(".tick").classList.add("transparent");
        });
      } else {
        elementsToBeUpdated.header.sysToggleItem.textContent =
          "Switch to Imperial";
        elementsToBeUpdated.header.metricItems.forEach((item) => {
          item.classList.add("selected");
          item.querySelector(".tick").classList.remove("transparent");
        });
        elementsToBeUpdated.header.imperialItems.forEach((item) => {
          item.classList.remove("selected");
          item.querySelector(".tick").classList.add("transparent");
        });
      }
      return;
    case "temp":
      elementsToBeUpdated.header.tempItems.forEach((item) => {
        item.classList.toggle("selected");
        item.querySelector(".tick").classList.toggle("transparent");
      });
      break;
    case "wind":
      elementsToBeUpdated.header.windSpeedItems.forEach((item) => {
        item.classList.toggle("selected");
        item.querySelector(".tick").classList.toggle("transparent");
      });
      break;
    case "precip":
      elementsToBeUpdated.header.precipItems.forEach((item) => {
        item.classList.toggle("selected");
        item.querySelector(".tick").classList.toggle("transparent");
      });
      break;
  }
  console.log(appStateProxy.unitSystem);
  
  if(appStateProxy.unitSystem === UNITS.metric){
        elementsToBeUpdated.header.sysToggleItem.textContent =
          "Switch to Imperial";
  }else{
        elementsToBeUpdated.header.sysToggleItem.textContent =
          "Switch to Metric";
  }
}
function searchRequest() {
  const searchInputEl = elementsToBeUpdated.search.input;
  const query = searchInputEl.value.trim();
  if (query.length > 3) {
    appStateProxy.citySearchRequestInProgress = true;
    Network.geocode(query).then((cities) => {
      appStateProxy.citySearchRequestInProgress = false;
      appStateProxy.searchResults = cities;
    });
  } else {
    return;
  }
}
function renderSearch() {
  const searchInputEl = elementsToBeUpdated.search.input;
  const btnSearchEl = document.querySelector(".search .btn");

  btnSearchEl.addEventListener("click", () => {
    searchRequest();
  });
  searchInputEl.addEventListener("focus", () => {
    searchRequest();
  });

  searchInputEl.addEventListener("input", () => {
    searchRequest();
  });
}
function updateSearchResultsDropdown() {
  const cities = appStateProxy.searchResults;
  const searchDropdownEl = elementsToBeUpdated.search.dropdown;
  if (cities.length === 0) {
    const noResultsItem = document.createElement("div");
    noResultsItem.classList.add("dropdown-item");
    noResultsItem.textContent = "No results found";
    searchDropdownEl.appendChild(noResultsItem);
    searchDropdownEl.classList.remove("hidden");
    return;
  }
  cities.forEach((city) => {
    const cityItem = document.createElement("div");
    cityItem.classList.add("dropdown-item");
    if(city.name === city.country){
      cityItem.textContent = `${city.name} (A Country)`;
    }
    else{
      cityItem.textContent = `${city.name? city.name : ""}${city.admin1? ", " + city.admin1 : ""}${city.country? ", " + city.country : ""}`;
    }

    cityItem.addEventListener("click", () => {
      appStateProxy.currentLocation.latitude = city.latitude;
      appStateProxy.currentLocation.longitude = city.longitude;
          if(city.name === city.country){
        appStateProxy.currentLocation.locationName = `${city.name} (A Country)`;
          }
          else{
            appStateProxy.currentLocation.locationName = `${city.name? city.name : ""}${city.country? ", " + city.country : ""}`;
          }
      searchDropdownEl.classList.add("hidden");
      appStateProxy.weatherRequestInProgress = true;
      weatherRequest();
    });

    searchDropdownEl.appendChild(cityItem);
  });
  searchDropdownEl.classList.remove("hidden");
}

function updateMain() {
  
  elementsToBeUpdated.current.backgroundImage.classList.remove("transparent");
  const currentWeatherData =
  appStateProxy.weatherData[appStateProxy.temperatureUnit.system];
  elementsToBeUpdated.current.temperature.textContent =
    currentWeatherData.currentTemperature;
  elementsToBeUpdated.current.weatherIcon.setAttribute(
    "src",
    currentWeatherData.weatherIcon
  );
  elementsToBeUpdated.current.weatherIcon.setAttribute(
    "alt",
    currentWeatherData.weatherDescription + " icon"
  );
  elementsToBeUpdated.current.date.textContent = currentWeatherData.currentTime;
  elementsToBeUpdated.current.location.textContent = `${appStateProxy.currentLocation.locationName}`;
  elementsToBeUpdated.current.apparentTemperature.textContent =
    currentWeatherData.currentApparentTemperature;
  elementsToBeUpdated.current.humidity.textContent =
    currentWeatherData.currentHumidity;
  elementsToBeUpdated.current.windSpeed.textContent =
    appStateProxy.weatherData[appStateProxy.windSpeedUnit.system].currentWindSpeed +
    " " +
    appStateProxy.windSpeedUnit.unit;
  elementsToBeUpdated.current.precipitation.textContent =
    appStateProxy.weatherData[appStateProxy.precipitationUnit.system].currentPrecipitation +
    " " +
    appStateProxy.precipitationUnit.unit;
    elementsToBeUpdated.current.location.parentNode.classList.remove("hidden");
    elementsToBeUpdated.current.weatherIcon.parentNode.classList.remove("hidden");
  }
function updateDaily() {
  elementsToBeUpdated.daily.dayItems.forEach((item, index) => {
    item.day.textContent =
      appState.weatherData[appState.temperatureUnit.system].daily[
        index
      ].weekDay;
    item.weatherIcon.setAttribute(
      "src",
      appState.weatherData[appState.temperatureUnit.system].daily[index]
        .weatherIcon
    );
    item.weatherIcon.setAttribute(
      "alt",
      appState.weatherData[appState.temperatureUnit.system].daily[index]
        .weatherDescription + " icon"
    );
    item.hTemp.textContent =
      appState.weatherData[appState.temperatureUnit.system].daily[
        index
      ].tempMax;
    item.lTemp.textContent =
      appState.weatherData[appState.temperatureUnit.system].daily[
        index
      ].tempMin;
  });
}
function initializeHourly() {
  const hoursList = document.querySelector(".hours-list");
  const hourlyInfoTemplate = document.querySelector(".hours-info-template");
  for (let i = 0; i < 24; i++) {
    let hourlyInfoClone = document.importNode(hourlyInfoTemplate.content, true);
    hoursList.appendChild(hourlyInfoClone);
  }
  appState.currentDayIndexInHourlyView = 0;
  elementsToBeUpdated.hourly.dayDropdownTrigger.addEventListener(
    "click",
    () => {
      elementsToBeUpdated.hourly.dayDropdown.classList.toggle("hidden");
    }
  );

  elementsToBeUpdated.hourly.dropdownItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      appStateProxy.currentDayIndexInHourlyView = index;
    });
  });
  elementsToBeUpdated.hourly.hoursItems = [
    ...document.querySelectorAll(".hours-list .hour-info-item"),
  ].map((item) => {
    return {
      hour: item.querySelector(".hour"),
      weatherIcon: item.querySelector(".icon"),
      temp: item.querySelector(".temp"),
    };
  });
}
function updateHourly() {
  elementsToBeUpdated.hourly.dropdownItems.forEach((item) => {
    item.classList.remove("selected");
  });

  elementsToBeUpdated.hourly.dropdownItems[
    appState.currentDayIndexInHourlyView
  ].classList.add("selected");
  elementsToBeUpdated.hourly.dayDropdown.classList.add("hidden");
  elementsToBeUpdated.hourly.dayDropdownTrigger.innerHTML = `<span>${
    appState.weatherData[appState.temperatureUnit.system].daily[
      appState.currentDayIndexInHourlyView
    ].hourly[0].weekDay
  }</span> <i class="ph ph-caret-down"></i>`;
  const hoursListData =
    appState.weatherData[appState.temperatureUnit.system].daily[
      appState.currentDayIndexInHourlyView
    ].hourly;
  elementsToBeUpdated.hourly.hoursItems.forEach((item, index) => {
    const iconEl = item.weatherIcon;
    const hourEl = item.hour;
    const tempEl = item.temp;
    const currentHourlyData = hoursListData[index];
    iconEl.setAttribute("src", currentHourlyData.weatherIcon);
    iconEl.setAttribute("alt", currentHourlyData.weatherDescription + " icon");
    hourEl.textContent = currentHourlyData.timeText;
    tempEl.textContent = currentHourlyData.temperature;
  });
  appState.weatherData[appState.temperatureUnit.system].daily.forEach(
    (dayData, index) => {
      elementsToBeUpdated.hourly.dropdownItems[index].textContent =
        dayData.hourly[0].weekDay;
    }
  );
}
function clearUi() {
  // clear main
  elementsToBeUpdated.current.backgroundImage.classList.add("transparent");
  elementsToBeUpdated.current.temperature.textContent = "";
  elementsToBeUpdated.current.weatherIcon.setAttribute("src", "");
  elementsToBeUpdated.current.weatherIcon.setAttribute("alt", "");
  elementsToBeUpdated.current.date.textContent = "";
  elementsToBeUpdated.current.location.textContent = "";
  elementsToBeUpdated.current.apparentTemperature.textContent = "";
  elementsToBeUpdated.current.humidity.textContent = "";
  elementsToBeUpdated.current.windSpeed.textContent = "";
  elementsToBeUpdated.current.precipitation.textContent = "";
  // clear daily
  elementsToBeUpdated.daily.dayItems.forEach((item) => {
    item.day.textContent = "";
    item.weatherIcon.setAttribute("src", "");
    item.weatherIcon.setAttribute("alt", "");
    item.hTemp.textContent = "";
    item.lTemp.textContent = "";
  });
  // clear hourly
  elementsToBeUpdated.hourly.dayDropdownTrigger.innerHTML = `__ <i class="ph ph-caret-down"></i>`;
  elementsToBeUpdated.hourly.hoursItems.forEach((item) => {
    item.hour.textContent = "";
    item.weatherIcon.setAttribute("src", "");
    item.weatherIcon.setAttribute("alt", "");
    item.temp.textContent = "";
  });
}
function hideDropdowns() {
  const unitDropdown = elementsToBeUpdated.header.dropdown;
  const searchDropdown = elementsToBeUpdated.search.dropdown;
  const hourlyDropdown = elementsToBeUpdated.hourly.dayDropdown;
  document.addEventListener("click", (e) => {
    if (!unitDropdown.classList.contains("hidden")) {
      if (
        e.target.closest(".header .dropdown") ||
        e.target.closest(".header .dropdown-trigger")
      ) {
        // do nothing
      } else {
        unitDropdown.classList.add("hidden");
      }
    } else if (!hourlyDropdown.classList.contains("hidden")) {
      if (
        e.target.closest(".hourly-forecast .dropdown-trigger") ||
        e.target.closest(".hourly-forecast .hourly-dropdown")
      ) {
        // do nothing
      } else {
        hourlyDropdown.classList.add("hidden");
      }
    } else if (!searchDropdown.classList.contains("hidden")) {
      if (
        e.target.closest(".search .dropdown") ||
        e.target.closest(".search input[type='search']")
      ) {
        // do nothing
      } else {
        searchDropdown.classList.add("hidden");
      }
    }
    if (
      !(
        e.target.closest(".dropdown") ||
        e.target.closest(".dropdown-trigger") ||
        e.target.closest("input[type='search']")
      )
    ) {
      elementsToBeUpdated.header.dropdown.classList.add("hidden");
      elementsToBeUpdated.search.dropdown.classList.add("hidden");
      elementsToBeUpdated.hourly.dayDropdown.classList.add("hidden");
    }
    if (e.target.closest("input[type='search']")) {
      elementsToBeUpdated.header.dropdown.classList.add("hidden");
      elementsToBeUpdated.hourly.dayDropdown.classList.add("hidden");
    }
  });
}
