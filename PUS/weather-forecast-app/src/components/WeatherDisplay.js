import React, { useState, useEffect } from 'react';

function WeatherDisplay({ cities }) {
  const [weatherData, setWeatherData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoading(true);
      
      // Create an object to store weather data for each city
      const newWeatherData = {};
      
      // For each city, fetch the weather forecast
      for (const cityItem of cities) {
        try {
          // In a real app, you would replace this with your Django API call
          // const response = await fetch(`/api/weather?city=${cityItem.city.name}&date=${cityItem.visitDate}`);
          // const data = await response.json();
          
          // Mock data for demonstration
          const mockWeather = {
            temperature: Math.floor(Math.random() * 30) + 5, // Random temp between 5-35°C
            condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 50) + 30, // Random humidity between 30-80%
            windSpeed: Math.floor(Math.random() * 30) + 5, // Random wind speed between 5-35 km/h
          };
          
          newWeatherData[cityItem.city.name] = mockWeather;
          
        } catch (error) {
          console.error(`Error fetching weather for ${cityItem.city.name}:`, error);
          newWeatherData[cityItem.city.name] = { error: 'Failed to load weather data' };
        }
      }
      
      // Simulating API delay
      setTimeout(() => {
        setWeatherData(newWeatherData);
        setIsLoading(false);
      }, 1000);
    };
    
    if (cities.length > 0) {
      fetchWeatherData();
    }
  }, [cities]);

  if (isLoading) {
    return <p className="text-center py-4">Loading weather forecasts...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cities.map((cityItem) => {
        const weather = weatherData[cityItem.city.name];
        
        return (
          <div key={cityItem.city.name} className="border rounded p-4 bg-gray-50">
            <h3 className="font-bold text-lg">{cityItem.city.name}</h3>
            <p className="text-sm text-gray-600">Visit date: {cityItem.visitDate}</p>
            
            {weather && !weather.error ? (
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{weather.temperature}°C</span>
                  <span className="text-lg">{weather.condition}</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Humidity: {weather.humidity}%</p>
                  <p>Wind: {weather.windSpeed} km/h</p>
                </div>
              </div>
            ) : weather && weather.error ? (
              <p className="text-red-500 mt-2">{weather.error}</p>
            ) : (
              <p className="text-gray-500 mt-2">Weather data not available</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default WeatherDisplay;