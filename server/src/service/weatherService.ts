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
  tempF: number; // Changed from temperature to tempF to match client expectations
  condition: string;
  humidity: number;
  windSpeed: number;
  constructor(city: string, date: string, icon: string, iconDescription: string, temperature: number, condition: string, humidity: number, windSpeed: number) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = temperature; // Changed to tempF
    this.condition = condition;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
  }
}
// TODO: Complete the WeatherService class
class WeatherService {
  private baseURL: string;
  private apiKey: string;
  private city: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || "https://api.openweathermap.org/data";
    this.apiKey = process.env.API_KEY || "";
    this.city = "";
    
    // Add validation
    if (!this.apiKey) {
      console.error("Warning: No API key found in environment variables. Weather data fetching will fail.");
    }
  }
  
  private async fetchLocationData(query: string): Promise<any> {
    this.city = query;
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch location data for ${query}`);
    }
    return await response.json();
  }

  private destructureLocationData(locationData: any): Coordinates {
    if (!locationData || locationData.length === 0) {
      throw new Error(`No location data found for ${this.city}`);
    }
    const { lat, lon } = locationData[0];
    return { lat, lon };
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&exclude=minutely,hourly&appid=${this.apiKey}`;
  }

  private async fetchAndDestructureLocationData() {
    const locationData = await this.fetchLocationData(this.city);
    return this.destructureLocationData(locationData);
  }

  private async fetchWeatherData(coordinates: Coordinates) {
    const url = this.buildWeatherQuery(coordinates);
    console.log(`Fetching weather data from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${errorText}`);
      throw new Error(`Failed to fetch weather data for ${this.city}`);
    }
    return await response.json();
  }

  private parseCurrentWeather(response: any) {
    const { current } = response;
    const { temp, humidity, wind_speed } = current;
    const { description, icon } = current.weather[0];
    return new Weather(this.city, new Date().toLocaleDateString(), icon, description, temp, 'Current', humidity, wind_speed);
  }

  private buildForecastArray(_currentWeather: Weather, weatherData: any): Weather[] {
    if (!weatherData || !weatherData.daily || !Array.isArray(weatherData.daily)) {
      throw new Error('Invalid weather data format');
    }
    
    return weatherData.daily.slice(1, 6).map((day: any) => {
      const { humidity, wind_speed } = day;
      const { description, icon } = day.weather[0];
      return new Weather(
        this.city, 
        new Date(day.dt * 1000).toLocaleDateString(), 
        icon, 
        description, 
        day.temp.day, 
        'Forecast', 
        humidity, 
        wind_speed
      );
    });
  }

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