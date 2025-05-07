import React, { useState } from 'react';
import { MapPin, Trash2, Edit, X, Check, ChevronRight } from 'lucide-react';

function RouteModal({ route, onClose, onRename, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(route.name);
  const [expandedCity, setExpandedCity] = useState(null);

  const handleRename = () => {
    onRename(route.id, newName);
    setIsEditing(false);
  };

  const toggleCityExpand = (cityId) => {
    setExpandedCity(expandedCity === cityId ? null : cityId);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {isEditing ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border-b px-2 py-1 w-full"
                autoFocus
              />
            ) : (
              route.name
            )}
          </h2>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewName(route.name);
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
                <button
                  onClick={handleRename}
                  className="p-1 text-green-600 hover:text-green-800"
                  disabled={!newName.trim()}
                >
                  <Check size={20} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-blue-600 hover:text-blue-800"
              >
                <Edit size={20} />
              </button>
            )}
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Route Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Start Date</p>
                <p>{formatDate(route.starts_at)}</p>
              </div>
              <div>
                <p className="text-gray-500">End Date</p>
                <p>{formatDate(route.ends_at)}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Cities</p>
                <p>{route.cities?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p>{route.last_forecast_update ? formatDate(route.last_forecast_update) : 'Never'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Cities</h3>
            {route.cities?.length > 0 ? (
              <ul className="space-y-2">
                {route.cities.map((city, index) => (
                  <li key={city.id} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCityExpand(city.id)}
                      className="w-full p-3 flex justify-between items-center hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-3">{index + 1}.</span>
                        <MapPin size={16} className="text-red-500 mr-2" />
                        <span>{city.city_name}</span>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`transition-transform ${expandedCity === city.id ? 'rotate-90' : ''}`}
                      />
                    </button>
                    
                    {expandedCity === city.id && (
                      <div className="p-3 bg-gray-50 border-t text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-gray-500">Arrival</p>
                            <p>{formatDate(city.arrival_date)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Departure</p>
                            <p>{formatDate(city.departure_date)}</p>
                          </div>
                        </div>
                        {/* Możesz dodać więcej szczegółów o mieście tutaj */}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">No cities in this route</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={() => onDelete(route.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
          >
            <Trash2 size={16} className="mr-2" />
            Delete Route
          </button>
        </div>
      </div>
    </div>
  );
}

export default RouteModal;