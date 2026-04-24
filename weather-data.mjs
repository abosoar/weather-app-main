
const UNITS = {
  metric: "metric",
  imperial: "imperial",
};

class WeatherData {

  constructor(data) {
    this.currentTime = new Date(data.current.time).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "long",
    year: "numeric",
    });
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.weatherIcon = WEATHER_CODE_MAP[data.current.weather_code].icon;
    this.weatherDescription = WEATHER_CODE_MAP[data.current.weather_code].description;
    this.currentTemperature = Math.round(data.current.temperature_2m) + "\u00B0";
    this.currentHumidity = Math.round(data.current.relative_humidity_2m) + "%";
    this.currentPrecipitation = Math.round(data.current.precipitation);
    this.currentWindSpeed = Math.round(data.current.wind_speed_10m);
    this.currentApparentTemperature = Math.round(data.current.apparent_temperature) + "\u00B0";
    this.currentWeatherCodeImage =
      WEATHER_CODE_MAP[data.current.weather_code].icon;
    this.timezone = data.timezone;
    this.daily = this.prepareDailyData(data.daily, data.hourly);
  }

  prepareDailyData(_dailyData, _hourlyData) {
    const dailyData = [];
          const dayHourlyData = {
        time: [],
        weather_code: [],
        temperature_2m: [],
      };
    for (let i = 0; i < _dailyData.time.length; i++) {
      const currentDay = new Date(_dailyData.time[i]).getDay();
      dayHourlyData.time = [];
      dayHourlyData.weather_code = [];
      dayHourlyData.temperature_2m = [];
      for (let j = 0; j < _hourlyData.time.length; j++) {
        const hourDay = new Date(_hourlyData.time[j]).getDay();

        if (currentDay === hourDay) {
          dayHourlyData.time.push(_hourlyData.time[j]);
          dayHourlyData.weather_code.push(_hourlyData.weather_code[j]);
          dayHourlyData.temperature_2m.push(_hourlyData.temperature_2m[j]);
        }
      }
      const dayData = new DayData(
        _dailyData.time[i],
        _dailyData.weather_code[i],
        _dailyData.temperature_2m_max[i],
        _dailyData.temperature_2m_min[i],
        dayHourlyData
      );
      dailyData.push(dayData);
    }
    return dailyData;
  }

}

class DayData {

  constructor(time, weatherCode, tempMax, tempMin, hourlyData) {
    this.date = time;
    this.weekDay = DAYS_MAP[new Date(time).getDay()].short;
    this.weatherIcon = WEATHER_CODE_MAP[weatherCode].icon;
    this.weatherDescription = WEATHER_CODE_MAP[weatherCode].description;
    this.tempMax = Math.round(tempMax) + "\u00B0";
    this.tempMin = Math.round(tempMin) + "\u00B0";
    this.hourly = this.prepareHourlyData(hourlyData);
  }

  prepareHourlyData(_hourlyData) {
    const hourlyData = [];
    for (let i = 0; i < _hourlyData.time.length; i++) {
      const hourData = new HourData(
        _hourlyData.time[i],
        _hourlyData.weather_code[i],
        _hourlyData.temperature_2m[i]
      );
      hourlyData.push(hourData);
    }
    return hourlyData;
  }
}
class HourData {
  constructor(time, weatherCode, temp) {
    this.time = time;
    this.weekDay = DAYS_MAP[new Date(time).getDay()].full;
    this.timeText =
      (new Date(time).getHours() % 12 || 12) +
      (new Date(time).getHours() >= 12 ? " PM" : " AM");
    this.weatherIcon = WEATHER_CODE_MAP[weatherCode].icon;
    this.weatherDescription = WEATHER_CODE_MAP[weatherCode].description;
    this.temperature = Math.round(temp) + "\u00B0";
  }
}


const WEATHER_CODE_MAP = {
  0: {
    description: "clear sky",
    icon: "./assets/images/icon-sunny.webp",
  },
  1: {
    description: "mainly clear",
    icon: "./assets/images/icon-partly-cloudy.webp",
  },
  2: {
    description: "partly cloudy",
    icon: "./assets/images/icon-partly-cloudy.webp",
  },
  3: {
    description: "overcast",
    icon: "./assets/images/icon-partly-cloudy.webp",
  },
  45: {
    description: "fog",
    icon: "./assets/images/icon-fog.webp",
  },
  48: {
    description: "depositing rime fog",
    icon: "./assets/images/icon-fog.webp",
  },
  51: {
    description: "light drizzle",
    icon: "./assets/images/icon-drizzle.webp",
  },
  53: {
    description: "moderate drizzle",
    icon: "./assets/images/icon-drizzle.webp",
  },
  55: {
    description: "dense drizzle",
    icon: "./assets/images/icon-drizzle.webp",
  },
  56: {
    description: "light freezing drizzle",
    icon: "./assets/images/icon-drizzle.webp",
  },
  57: {
    description: "dense freezing drizzle",
    icon: "./assets/images/icon-drizzle.webp",
  },
  61: {
    description: "slight rain",
    icon: "./assets/images/icon-rain.webp",
  },
  63: {
    description: "moderate rain",
    icon: "./assets/images/icon-rain.webp",
  },
  65: {
    description: "heavy rain",
    icon: "./assets/images/icon-rain.webp",
  },
  66: {
    description: "light freezing rain",
    icon: "./assets/images/icon-rain.webp",
  },
  67: {
    description: "heavy freezing rain",
    icon: "./assets/images/icon-rain.webp",
  },
  71: {
    description: "slight snowfall",
    icon: "./assets/images/icon-snow.webp",
  },
  73: {
    description: "moderate snowfall",
    icon: "./assets/images/icon-snow.webp",
  },
  75: {
    description: "heavy snowfall",
    icon: "./assets/images/icon-snow.webp",
  },
  77: {
    description: "snow grains",
    icon: "./assets/images/icon-snow.webp",
  },
  80: {
    description: "slight rain showers",
    icon: "./assets/images/icon-rain.webp",
  },
  81: {
    description: "moderate rain showers",
    icon: "./assets/images/icon-rain.webp",
  },
  82: {
    description: "violent rain showers",
    icon: "./assets/images/icon-rain.webp",
  },
  85: {
    description: "slight snow showers",
    icon: "./assets/images/icon-snow.webp",
  },
  86: {
    description: "heavy snow showers",
    icon: "./assets/images/icon-snow.webp",
  },
  95: {
    description: "slight thunderstorm",
    icon: "./assets/images/icon-storm.webp",
  },
  96: {
    description: "slight hail thunderstorm",
    icon: "./assets/images/icon-storm.webp",
  },
  99: {
    description: "heavy hail thunderstorm",
    icon: "./assets/images/icon-storm.webp",
  },
};

const DAYS_MAP = {
  0: { full: "Sunday", short: "Sun" },
  1: { full: "Monday", short: "Mon" },
  2: { full: "Tuesday", short: "Tue" },
  3: { full: "Wednesday", short: "Wed" },
  4: { full: "Thursday", short: "Thu" },
  5: { full: "Friday", short: "Fri" },
  6: { full: "Saturday", short: "Sat" },
};


export { WeatherData, UNITS };
