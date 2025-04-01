import React, { useState } from 'react';
import { X, Calendar, MapPin, Trash2 } from 'lucide-react';

function RouteModal({ route, onClose, onRename, onDelete }) {
  const [editName, setEditName] = useState(route.name);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Handle save of renamed route
  const handleSaveRename = () => {
    if (editName.trim() === '') return;
    onRename(route.id, editName.trim());
    setIsEditing(false);
  };
  
  // Handle delete confirmation
  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(route.id);
      onClose();
    } else {
      setConfirmDelete(true);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate total trip duration
  const calculateTripDuration = () => {
    if (route.cities.length === 0) return 0;
    
    // Find earliest arrival and latest departure
    let earliestArrival = new Date(route.cities[0].arrivalDate);
    let latestDeparture = new Date(route.cities[0].departureDate);
    
    route.cities.forEach(city => {
      const arrival = new Date(city.arrivalDate);
      const departure = new Date(city.departureDate);
      
      if (arrival < earliestArrival) earliestArrival = arrival;
      if (departure > latestDeparture) latestDeparture = departure;
    });
    
    // Calculate difference in days
    const diffTime = Math.abs(latestDeparture - earliestArrival);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both arrival and departure days
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          {isEditing ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 px-2 py-1 border rounded"
                autoFocus
              />
              <button 
                onClick={handleSaveRename}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Save
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{route.name}</h2>
              <button 
                onClick={() => setIsEditing(true)}
                className="text-blue-500 text-sm hover:text-blue-700"
              >
                Rename
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDelete}
              className={`p-2 rounded-full ${confirmDelete ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}`}
              title="Delete route"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        {confirmDelete && (
          <div className="p-4 bg-red-50 border-b border-red-100">
            <p className="text-red-700 mb-2">Are you sure you want to delete this route?</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => onDelete(route.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        )}
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-gray-700 mb-1">
              <Calendar size={18} />
              <span>{calculateTripDuration()} days trip</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={18} />
              <span>{route.cities.length} {route.cities.length === 1 ? 'city' : 'cities'}</span>
            </div>
          </div>
          
          {/* Cities List */}
          <h3 className="text-lg font-semibold mb-4">Itinerary</h3>
          
          <div className="space-y-4">
            {route.cities.map((city, index) => (
              <div key={city.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-lg">{city.name}</h4>
                    <p className="text-gray-600">
                      {formatDate(city.arrivalDate)}
                      {city.arrivalDate !== city.departureDate && 
                        ` - ${formatDate(city.departureDate)}`}
                    </p>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {city.condition}, {city.temperature}°
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Humidity</p>
                    <p>{city.humidity}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Wind</p>
                    <p>{city.windSpeed} km/h</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Weather Summary */}
          <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-800">Weather Summary</h4>
            <p className="text-sm text-blue-700 mt-1">
              {route.cities.some(city => 
                city.condition.toLowerCase().includes('rain')
              ) 
                ? "Pack an umbrella! Rain is expected during your trip."
                : "The weather looks great for your trip. Enjoy your visit!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RouteModal;