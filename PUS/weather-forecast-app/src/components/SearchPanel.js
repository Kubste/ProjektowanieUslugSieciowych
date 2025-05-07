import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function SearchPanel({ cities, onAddCity, lastDepartureDate, api }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [arrivalDate, setArrivalDate] = useState(null);
  const [departureDate, setDepartureDate] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [dateErrors, setDateErrors] = useState({
    arrival: '',
    departure: ''
  });

  const filteredCities = cities.filter(city =>
    city.city_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    // Enter key
    if (e.keyCode === 13) {
      e.preventDefault();
      if (filteredCities[activeSuggestion]) {
        setSelectedCity(filteredCities[activeSuggestion]);
        setSearchTerm(filteredCities[activeSuggestion].city_name);
        setShowSuggestions(false);
      }
    }
    // Up arrow
    else if (e.keyCode === 38) {
      if (activeSuggestion > 0) {
        setActiveSuggestion(activeSuggestion - 1);
      }
    }
    // Down arrow
    else if (e.keyCode === 40) {
      if (activeSuggestion < filteredCities.length - 1) {
        setActiveSuggestion(activeSuggestion + 1);
      }
    }
  };

  useEffect(() => {
    setShowSuggestions(searchTerm.length > 0 && filteredCities.length > 0);
  }, [searchTerm, filteredCities]);

  const validateDates = (newArrival, newDeparture) => {
    const errors = { arrival: '', departure: '' };
    const today = new Date();

    if (newArrival) {
      if (newArrival < today) {
        errors.arrival = 'Arrival date cannot be in the past';
      }
      
      if (lastDepartureDate && newArrival < new Date(lastDepartureDate)) {
        errors.arrival = 'Arrival must be after last departure';
      }
    }

    if (newDeparture) {
      if (newArrival && newDeparture < newArrival) {
        errors.departure = 'Departure must be after arrival';
      }
    }

    setDateErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  const handleArrivalChange = (date) => {
    setArrivalDate(date);
    validateDates(date, departureDate);
    
    if (departureDate && date > departureDate) {
      setDepartureDate(null);
    }
  };

  const handleDepartureChange = (date) => {
    setDepartureDate(date);
    validateDates(arrivalDate, date);
  };

  const handleAddCity = async () => {
    if (!selectedCity || !arrivalDate || !departureDate) return;
    
    if (!validateDates(arrivalDate, departureDate)) {
      return;
    }
    
    const cityWithDates = {
      id: selectedCity.id,
      city_name: selectedCity.city_name,
      arrivalDate: arrivalDate.toISOString().split('T')[0],
      departureDate: departureDate.toISOString().split('T')[0]
    };
    
    try {
      // Najpierw dodaj miasto do trasy
      await onAddCity(cityWithDates);
      
      // Następnie pobierz prognozę
      const forecastResponse = await api.post('/api/forecast/', {
        cityId: selectedCity.id,
        startDate: cityWithDates.arrivalDate,
        endDate: cityWithDates.departureDate
      });
      
      console.log('Prognoza pobrana:', forecastResponse.data);
      
      // Reset formularza
      setSelectedCity(null);
      setSearchTerm('');
      setArrivalDate(null);
      setDepartureDate(null);
      setDateErrors({ arrival: '', departure: '' });
      
    } catch (error) {
      console.error('Błąd podczas dodawania miasta lub pobierania prognozy:', error);
    }
  };
  const fetchSuggestions = async (query) => {
    try {
      const response = await api.get(`/api/city/search/?q=${query}`);
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (searchTerm.length > 2) {
      const timer = setTimeout(() => {
        fetchSuggestions(searchTerm);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Add City to Route</h2>
      
      <div className="mb-4 relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Search City</label>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedCity(null);
              setActiveSuggestion(0);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter city name"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
        </div>
        
        {searchTerm && suggestions.length > 0 && (
          <ul className="mt-1 border rounded-md max-h-60 overflow-y-auto absolute z-10 w-full bg-white shadow-lg">
            {suggestions.map((city) => (
              <li 
                key={city.id || city.city_name}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedCity(city);
                  setSearchTerm(city.city_name);
                  setSuggestions([]);
                }}
              >
                {city.city_name}
                {city.latitude && city.longitude && (
                  <span className="text-xs text-gray-500 ml-2">
                    ({Number(city.latitude).toFixed(2)}, {Number(city.longitude).toFixed(2)})
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {selectedCity && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label>
            <DatePicker
              selected={arrivalDate}
              onChange={handleArrivalChange}
              minDate={lastDepartureDate ? new Date(lastDepartureDate) : new Date()}
              selectsStart
              startDate={arrivalDate}
              endDate={departureDate}
              className={`w-full px-3 py-2 border rounded-md ${dateErrors.arrival ? 'border-red-500' : ''}`}
              placeholderText="Select arrival date"
            />
            {dateErrors.arrival && (
              <p className="text-red-500 text-xs mt-1">{dateErrors.arrival}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
            <DatePicker
              selected={departureDate}
              onChange={handleDepartureChange}
              minDate={arrivalDate || new Date()}
              selectsEnd
              startDate={arrivalDate}
              endDate={departureDate}
              className={`w-full px-3 py-2 border rounded-md ${dateErrors.departure ? 'border-red-500' : ''}`}
              placeholderText="Select departure date"
            />
            {dateErrors.departure && (
              <p className="text-red-500 text-xs mt-1">{dateErrors.departure}</p>
            )}
          </div>
          
          <button
            onClick={handleAddCity}
            disabled={!arrivalDate || !departureDate || dateErrors.arrival || dateErrors.departure}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add City
          </button>
        </>
      )}
    </div>
  );
}

export default SearchPanel;