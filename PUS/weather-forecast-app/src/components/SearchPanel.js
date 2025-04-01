import React, { useState, useEffect } from 'react';
import { Search, Calendar, Plus } from 'lucide-react';

function SearchPanel({ onAddCity, lastDepartureDate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [arrivalDate, setArrivalDate] = useState(null);
  const [departureDate, setDepartureDate] = useState(null);
  const [dateSelectionPhase, setDateSelectionPhase] = useState('arrival'); // 'arrival' or 'departure'
  const [dateError, setDateError] = useState('');
  
  // Use effect to enforce minimum arrival date
  useEffect(() => {
    // If this is not the first city (lastDepartureDate exists)
    // and no arrival date is set yet, set a minimum default
    if (lastDepartureDate && !arrivalDate) {
      // Convert string date to Date object if needed
      const minDate = typeof lastDepartureDate === 'string' 
        ? new Date(lastDepartureDate) 
        : lastDepartureDate;
        
      // Update selected month to show the proper calendar
      setSelectedMonth(new Date(minDate));
    }
  }, [lastDepartureDate]);
  
  // Search for cities (mock implementation)
  const handleSearch = (term) => {
    setSearchTerm(term);
    
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    
    // Mock search results
    const mockCities = [
      { id: 1, name: 'New York', country: 'USA', temperature: 22, condition: 'Sunny', humidity: 45, windSpeed: 8 },
      { id: 2, name: 'London', country: 'UK', temperature: 15, condition: 'Rainy', humidity: 75, windSpeed: 12 },
      { id: 3, name: 'Paris', country: 'France', temperature: 18, condition: 'Partly Cloudy', humidity: 60, windSpeed: 10 },
      { id: 4, name: 'Tokyo', country: 'Japan', temperature: 24, condition: 'Clear', humidity: 50, windSpeed: 6 },
      { id: 5, name: 'Sydney', country: 'Australia', temperature: 27, condition: 'Sunny', humidity: 40, windSpeed: 15 },
    ];
    
    const results = mockCities.filter(city => 
      city.name.toLowerCase().includes(term.toLowerCase())
    );
    
    setSearchResults(results);
  };
  
  // Handle date selection
  const handleDateSelect = (date) => {
    // Clear previous errors
    setDateError('');
    
    // Check if this date respects the minimum date from previous city
    if (lastDepartureDate) {
      const minDate = new Date(lastDepartureDate);
      // Reset time part to compare just the dates
      minDate.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      if (date < minDate) {
        setDateError(`Arrival date must be on or after ${minDate.toLocaleDateString()}`);
        return;
      }
    }
    
    if (dateSelectionPhase === 'arrival') {
      setArrivalDate(date);
      setDateSelectionPhase('departure');
      
      // If there was a previously set departure date that's now invalid, clear it
      if (departureDate && departureDate < date) {
        setDepartureDate(null);
      }
    } else {
      // Make sure departure date is not before arrival date
      if (arrivalDate && date < arrivalDate) {
        setDateError('Departure date cannot be before arrival date');
        return;
      }
      setDepartureDate(date);
      setDateSelectionPhase('arrival'); // Reset for next selection
    }
  };
  
  // Reset date selection
  const resetDateSelection = () => {
    setArrivalDate(null);
    setDepartureDate(null);
    setDateSelectionPhase('arrival');
    setDateError('');
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get days of week
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Generate week headers
    const weekHeaders = dayNames.map(day => (
      <div key={day} className="text-center text-xs font-medium text-gray-500 uppercase py-2">
        {day}
      </div>
    ));
    
    // Get today's date for reference
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get minimum date (if applicable)
    let minDate = null;
    if (lastDepartureDate) {
      minDate = new Date(lastDepartureDate);
      minDate.setHours(0, 0, 0, 0);
    }
    
    // Generate empty cells for days before the first day of month
    let days = Array(firstDay).fill(null).map((_, i) => (
      <div key={`empty-${i}`} className="p-2"></div>
    ));
    
    // Generate day cells
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0);
      
      // Check if this date is arrival, departure, or in between
      const isArrival = arrivalDate && 
        date.getDate() === arrivalDate.getDate() &&
        date.getMonth() === arrivalDate.getMonth() &&
        date.getFullYear() === arrivalDate.getFullYear();
        
      const isDeparture = departureDate && 
        date.getDate() === departureDate.getDate() &&
        date.getMonth() === departureDate.getMonth() &&
        date.getFullYear() === departureDate.getFullYear();
        
      const isInRange = arrivalDate && departureDate && 
        date > arrivalDate && date < departureDate;
      
      // Check if date is before minimum allowed date
      const isBeforeMinDate = minDate && date < minDate;
      // Check if date is in the past (before today)
      const isPastDate = date < today;
      
      // Determine if this date should be disabled
      const isDisabled = isBeforeMinDate || isPastDate;
      
      // If we're selecting departure date, disable dates before arrival
      const isBeforeArrival = dateSelectionPhase === 'departure' && arrivalDate && date < arrivalDate;
      
      let className = 'p-2 text-center rounded-full';
      
      if (isDisabled || isBeforeArrival) {
        className += ' text-gray-300 cursor-not-allowed';
      } else {
        className += ' cursor-pointer hover:bg-gray-200';
      }
      
      if (isArrival) {
        className = 'p-2 text-center cursor-pointer bg-blue-500 text-white hover:bg-blue-600 rounded-full';
      } else if (isDeparture) {
        className = 'p-2 text-center cursor-pointer bg-red-500 text-white hover:bg-red-600 rounded-full';
      } else if (isInRange) {
        className = 'p-2 text-center cursor-pointer bg-blue-100 hover:bg-blue-200 rounded-full';
      }
      
      days.push(
        <div 
          key={i}
          onClick={() => !isDisabled && !isBeforeArrival && handleDateSelect(date)}
          className={className}
        >
          {i}
        </div>
      );
    }
    
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
            className="px-2 py-1"
          >
            &lt;
          </button>
          <h3 className="font-medium">
            {selectedMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
            className="px-2 py-1"
          >
            &gt;
          </button>
        </div>
        
        <div className="grid grid-cols-7">
          {weekHeaders}
          {days}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">
              {dateSelectionPhase === 'arrival' ? 'Select arrival date' : 'Select departure date'}
            </p>
            <div className="flex mt-1 text-sm gap-2">
              <span className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div> Arrival
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div> Departure
              </span>
            </div>
          </div>
          
          {(arrivalDate || departureDate) && (
            <button
              onClick={resetDateSelection}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              Reset
            </button>
          )}
        </div>
        
        {dateError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {dateError}
          </div>
        )}
      </div>
    );
  };
  
  // Add city to selection with dates
  const handleAddCity = (city) => {
    if (!arrivalDate) {
      setDateError('Please select at least an arrival date');
      return;
    }
    
    onAddCity({
      ...city,
      arrivalDate: arrivalDate.toISOString().split('T')[0],
      departureDate: departureDate ? departureDate.toISOString().split('T')[0] : arrivalDate.toISOString().split('T')[0]
    });
    
    // Clear search
    setSearchTerm('');
    setSearchResults([]);
    resetDateSelection();
  };

  return (
    <div className="p-6 h-full">
      {/* Search box */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search cities..."
            className="w-full px-4 py-3 pl-10 rounded-lg bg-white shadow-sm"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
        </div>
        
        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white rounded-lg shadow-lg">
            {searchResults.map(city => (
              <div
                key={city.id}
                className="px-4 py-3 flex justify-between items-center border-b last:border-none hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{city.name}</p>
                  <p className="text-sm text-gray-500">{city.country}</p>
                </div>
                <button
                  onClick={() => handleAddCity(city)}
                  className="p-2 rounded-full hover:bg-gray-200"
                >
                  <Plus size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {generateCalendarDays()}
      </div>
    </div>
  );
}

export default SearchPanel;