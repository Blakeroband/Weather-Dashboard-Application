import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}
// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  constructor(city: string, date: string, icon: string, iconDescription: string, temperature: number, condition: string, humidity: number, windSpeed: number) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.temperature = temperature;
    this.condition = condition;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
  }
}
// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL: string;
  private apiKey: string;
  private city: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || "https://api.openweathermap.org/data/2.5";
    this.apiKey = process.env.API_KEY || "";
    this.city = "";
  }
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<any> {
    this.city = query;
    const response = await fetch(`${this.baseURL}/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch location data for ${query}`);
    }
    return await response.json();
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
  if (!locationData || locationData.length === 0) {
    throw new Error(`No location data found`);
  }
  const { lat, lon } = locationData[0];
  return { lat, lon };
  }


  // TODO: Create buildGeocodeQuery method
  // private buildGeocodeQuery(): string {
  //   if (!this.city) {
  //     throw new Error('City name is required');
  //   }
    
  //   return `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(this.city)}&limit=1&appid=${this.apiKey}`;
  // }


  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&exclude=minutely,hourly&appid=${this.apiKey}`;
  }


  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const locationData = await this.fetchLocationData(this.city);
    return this.destructureLocationData(locationData);
  }


  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const response = await fetch(this.buildWeatherQuery(coordinates));
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data for ${this.city}`);
    }
    return await response.json();
  }


  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const { current } = response;
    const { temp, humidity, wind_speed } = current;
    const { description, icon } = current.weather[0];
    return new Weather(this.city, new Date().toLocaleDateString(), icon, description, temp, 'Current', humidity, wind_speed);
  }


  // TODO: Complete buildForecastArray method
  private buildForecastArray(_currentWeather: Weather, weatherData: any): Weather[] {
    // Ensure weatherData has the daily property
    if (!weatherData || !weatherData.daily || !Array.isArray(weatherData.daily)) {
      throw new Error('Invalid weather data format');
    }
    
    // Take only the first 5 days for the forecast
    return weatherData.daily.slice(1, 6).map((day: any) => {
      const { temp, humidity, wind_speed } = day;
      const { description, icon } = day.weather[0];
      return new Weather(
        this.city, 
        new Date(day.dt * 1000).toLocaleDateString(), 
        icon, 
        description, 
        temp.day, 
        'Forecast', 
        humidity, 
        wind_speed
      );
    });
  }


  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.city = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecast = this.buildForecastArray(currentWeather, weatherData);
    return [currentWeather, ...forecast];
  }
}

export default new WeatherService();
