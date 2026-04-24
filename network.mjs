import { UNITS, WeatherData } from "./weather-data.mjs";
const RESULTS_LIMIT = 10;
class Network {
  static async geocode(cityName) {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=${RESULTS_LIMIT}&language=en&format=json`
    );
    const data = await response.json();
    if (!data.results){
      return [];
    }
    const cities = data.results
      .map(
        (result) =>
          new City(
            result.name,
            result.admin1,
            result.country,
            result.latitude,
            result.longitude,
            result.timezone
          )
      )

    return cities;
  }
  static async weatherRequest(longitude, latitude) {
    try {
      let metricData, imperialData;
      const metricResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,apparent_temperature`
      );
      const metricJson = await metricResponse.json();
      metricData = new WeatherData(metricJson, UNITS.metric);

      const imperialResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,apparent_temperature&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch`
      );
      const imperialJson = await imperialResponse.json();
      imperialData = new WeatherData(imperialJson);
      return {
        metric: metricData,
        imperial: imperialData,
      };
    } catch (error) {
      console.error("Weather request error:", error);
      throw error;
    }
  }

  static async getCountryFromIP() {
    const response = await fetch(`https://ipapi.co/json/`);
    const data = await response.json();
    return data.country;
  }
}
class City {
  constructor(name, admin1, country, latitude, longitude, timezone) {
    this.name = name;
    this.admin1 = admin1;
    this.country = country;
    this.latitude = latitude;
    this.longitude = longitude;
    this.timezone = timezone;
  }
}
export default Network;
