import React, { useEffect, useState } from 'react';
import { Thermometer, Droplet, Wind, Cloud, Calendar as CalendarIcon } from 'lucide-react';

const WeatherCard = ({ city, onRemove, api }) => {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await api.get(`/api/forecast/?cityId=${city.id}&startDate=${city.arrivalDate}&endDate=${city.departureDate}`);
        setForecast(response.data);
      } catch (error) {
        console.error('Error fetching forecast:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [city, api]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold">{city.city_name}</h3>
        <button onClick={onRemove} className="text-red-500 hover:text-red-700">
          Remove
        </button>
      </div>
      
      <div className="flex items-center text-sm text-gray-500 mt-1 mb-3">
        <CalendarIcon className="mr-1" size={14} />
        {city.arrivalDate} to {city.departureDate}
      </div>

      {loading ? (
        <p>Loading forecast...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forecast.map((day) => (
            <div key={day.date} className="border rounded-lg p-3">
              <div className="font-medium">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="text-sm text-gray-500">{day.date}</div>
              <div className="flex items-center mt-2">
                <Thermometer className="mr-2" size={16} />
                <span>{day.temp}°C (feels {day.feels_like}°C)</span>
              </div>
              <div className="flex items-center mt-1">
                <Droplet className="mr-2" size={16} />
                <span>Humidity: {day.humidity}%</span>
              </div>
              <div className="flex items-center mt-1">
                <Wind className="mr-2" size={16} />
                <span>Wind: {day.wind_speed} m/s</span>
              </div>
              <div className="flex items-center mt-1">
                <Cloud className="mr-2" size={16} />
                <span>{day.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherCard;