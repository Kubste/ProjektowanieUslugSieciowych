import React from 'react';
import { X, Cloud, CloudRain, Sun, CloudLightning, Droplets, Wind } from 'lucide-react';

function WeatherDetailModal({ city, onClose }) {
  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Generate dates between arrival and departure
  const getDatesInRange = () => {
    const dates = [];
    const start = new Date(city.arrivalDate);
    const end = new Date(city.departureDate);
    
    // Create a copy of the start date
    let currentDate = new Date(start);
    
    // Loop through all dates until end date is reached
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };
  
  // Helper function to get weather icon based on condition
  const getWeatherIcon = (condition, size = 24) => {
    switch (condition.toLowerCase()) {
      case 'rain':
      case 'rainy':
        return <CloudRain size={size} className="text-blue-400" />;
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud size={size} className="text-gray-400" />;
      case 'storm':
      case 'thunderstorm':
        return <CloudLightning size={size} className="text-gray-600" />;
      case 'sunny':
      case 'clear':
      default:
        return <Sun size={size} className="text-yellow-400" />;
    }
  };
  
  // Generate mock weather data for each day in the range
  const generateDailyWeatherData = () => {
    const dates = getDatesInRange();
    const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'];
    
    return dates.map((date, index) => {
      // Generate somewhat realistic but random weather data
      // Base it on the original city weather with some variation
      const baseTemp = city.temperature;
      const tempVariation = Math.floor(Math.random() * 7) - 3; // -3 to +3 degrees
      const randomConditionIndex = Math.floor(Math.random() * conditions.length);
      
      return {
        date: date,
        temperature: baseTemp + tempVariation,
        condition: conditions[randomConditionIndex],
        humidity: Math.floor(Math.random() * 20) + (city.humidity - 10), // Vary around city humidity
        windSpeed: Math.floor(Math.random() * 10) + (city.windSpeed - 5), // Vary around city wind speed
        precipitationChance: Math.floor(Math.random() * 100),
        uvIndex: Math.floor(Math.random() * 11), // 0-10
      };
    });
  };
  
  const dailyWeather = generateDailyWeatherData();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">{city.name}, {city.country}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Weather Forecast</h3>
            <p className="text-gray-600">
              {formatDate(city.arrivalDate)} - {formatDate(city.departureDate)}
            </p>
          </div>
          
          {/* Current Weather Summary */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center">
                {getWeatherIcon(city.condition, 80)}
                <div className="ml-4">
                  <h4 className="text-4xl font-bold">{city.temperature}°C</h4>
                  <p className="text-xl text-gray-700">{city.condition}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div className="flex items-center">
                  <Droplets className="text-blue-500 mr-2" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Humidity</p>
                    <p className="font-medium">{city.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Wind className="text-blue-500 mr-2" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Wind</p>
                    <p className="font-medium">{city.windSpeed} km/h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Daily Forecast */}
          <h3 className="text-xl font-semibold mb-4">Daily Forecast</h3>
          <div className="space-y-4">
            {dailyWeather.map((day, index) => (
              <div 
                key={index}
                className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 md:grid-cols-6 gap-2 items-center"
              >
                <div className="md:col-span-1">
                  <p className="font-medium">{formatDate(day.date)}</p>
                </div>
                
                <div className="flex items-center md:col-span-1">
                  {getWeatherIcon(day.condition)}
                  <span className="ml-2">{day.condition}</span>
                </div>
                
                <div className="md:col-span-1">
                  <p className="text-lg font-semibold">{day.temperature}°C</p>
                </div>
                
                <div className="md:col-span-1">
                  <p className="text-sm text-gray-500">Humidity</p>
                  <p>{day.humidity}%</p>
                </div>
                
                <div className="md:col-span-1">
                  <p className="text-sm text-gray-500">Wind</p>
                  <p>{day.windSpeed} km/h</p>
                </div>
                
                <div className="md:col-span-1">
                  <p className="text-sm text-gray-500">Precipitation</p>
                  <p>{day.precipitationChance}%</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Weather Advisory */}
          <div className="mt-8 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800">Weather Advisory</h4>
            <p className="text-sm text-yellow-700 mt-1">
              {dailyWeather.some(day => day.condition.toLowerCase().includes('rain')) 
                ? "Pack an umbrella! Rain is expected during your visit."
                : "The weather looks great for your trip. Enjoy your visit!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherDetailModal;