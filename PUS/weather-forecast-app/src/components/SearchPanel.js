import React, { useState } from 'react';
import { Search, Calendar } from 'lucide-react';

function SearchPanel({ cities, onAddCity, lastDepartureDate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');

  const filteredCities = cities.filter(city =>
    city.city_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCity = () => {
    if (!selectedCity || !arrivalDate || !departureDate) return;
    
    const cityWithDates = {
      id: selectedCity.id,
      city_name: selectedCity.city_name,
      arrivalDate,
      departureDate
    };
    
    onAddCity(cityWithDates);
    setSelectedCity(null);
    setSearchTerm('');
    setArrivalDate('');
    setDepartureDate('');
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Add City to Route</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Search City</label>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter city name"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
        </div>
        
        {searchTerm && filteredCities.length > 0 && (
          <ul className="mt-1 border rounded-md max-h-60 overflow-y-auto">
            {filteredCities.map(city => (
              <li 
                key={city.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedCity(city);
                  setSearchTerm(city.city_name);
                }}
              >
                {city.city_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {selectedCity && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label>
            <div className="relative">
              <input
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                min={lastDepartureDate || undefined}
                className="w-full px-3 py-2 border rounded-md"
              />
              <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
            <div className="relative">
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={arrivalDate || undefined}
                className="w-full px-3 py-2 border rounded-md"
              />
              <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
          
          <button
            onClick={handleAddCity}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Add City
          </button>
        </>
      )}
    </div>
  );
}

export default SearchPanel;