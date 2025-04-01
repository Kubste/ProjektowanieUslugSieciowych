import React, { useState } from 'react';
import { X, Cloud, CloudRain, Sun, CloudLightning } from 'lucide-react';
import WeatherDetailModal from './WeatherDetailModal';

// Helper function to get weather icon based on condition
const getWeatherIcon = (condition) => {
  switch (condition.toLowerCase()) {
    case 'rain':
    case 'rainy':
      return <CloudRain size={64} className="text-blue-400" />;
    case 'cloudy':
    case 'partly cloudy':
      return <Cloud size={64} className="text-gray-400" />;
    case 'storm':
    case 'thunderstorm':
      return <CloudLightning size={64} className="text-gray-600" />;
    case 'sunny':
    case 'clear':
    default:
      return <Sun size={64} className="text-yellow-400" />;
  }
};

function WeatherCard({ city, onRemove }) {
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Generate date range text
  const getDateRangeText = () => {
    const isSameDay = city.arrivalDate === city.departureDate;
    if (isSameDay) {
      return formatDate(city.arrivalDate);
    }
    return `${formatDate(city.arrivalDate)} - ${formatDate(city.departureDate)}`;
  };

  return (
    <>
      <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div 
              className="cursor-pointer hover:text-blue-600"
              onClick={() => setShowDetailModal(true)}
            >
              <h2 className="text-2xl font-bold">{city.name}</h2>
              <p className="text-gray-600">{getDateRangeText()}</p>
            </div>
            <button
              onClick={onRemove}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mt-6 flex justify-center">
            {getWeatherIcon(city.condition)}
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-3xl font-bold">{city.temperature}°</p>
            <p className="text-gray-600">{city.condition}</p>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Humidity</p>
                <p className="font-medium">{city.humidity}%</p>
              </div>
              <div>
                <p className="text-gray-500">Wind</p>
                <p className="font-medium">{city.windSpeed} km/h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed Weather Modal */}
      {showDetailModal && (
        <WeatherDetailModal 
          city={city} 
          onClose={() => setShowDetailModal(false)} 
        />
      )}
    </>
  );
}

export default WeatherCard;
