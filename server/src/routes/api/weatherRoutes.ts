import { Router } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

const router = Router();

// import HistoryService from '../../service/historyService.js';
// import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).send('City name is required');
    }
    
    // Save city to history
    const savedCity = await HistoryService.addCity(city);
    
    // Get weather data for city
    const weatherData = await WeatherService.getWeatherForCity(city);
    
    // Return both the saved city and weather data
    return res.status(200).json({
      city: savedCity,
      weather: weatherData
    });
  } catch (error) {
    console.error('Error processing weather request:', error);
    return res.status(500).send('Error processing request');
  }
});

// TODO: GET search history
router.get('/history', async (_req, res) => {
  try {
    const history = await HistoryService.getCities();
    res.status(200).send(history);
  } catch (error) {
    res.status(500).send('Error retrieving history');
  }
});

// * BONUS TODO: DELETE city from search history
// router.delete('/history/:id', async (req, res) => {

// });

export default router;
