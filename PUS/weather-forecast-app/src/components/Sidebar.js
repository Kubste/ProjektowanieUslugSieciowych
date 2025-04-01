import React from 'react';
import { X, MapPin, Info, RefreshCw } from 'lucide-react';

function Sidebar({ isOpen, savedRoutes, onLoadRoute, onViewRouteDetails, onClose }) {
  return (
    <div 
      className={`
        fixed inset-y-0 left-0 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-20
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:transform-none md:w-64 md:z-auto md:block md:shadow-none
        ${isOpen ? 'md:block' : 'md:hidden'}
      `}
      style={{ width: '280px' }}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Saved Routes</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 md:hidden"
          >
            <X size={20} />
          </button>
        </div>
        
        {savedRoutes.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No saved routes yet. Create and save a route to see it here.
          </p>
        ) : (
          <ul className="space-y-2">
            {savedRoutes.map(route => (
              <li key={route.id} className="bg-white rounded-lg shadow-sm">
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2">
                      <MapPin size={18} className="mt-0.5 flex-shrink-0 text-blue-500" />
                      <div>
                        <h3 className="font-medium">{route.name}</h3>
                        <p className="text-sm text-gray-500">
                          {route.cities.length} {route.cities.length === 1 ? 'city' : 'cities'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-between gap-2">
                    <button
                      onClick={() => onViewRouteDetails(route.id)}
                      className="flex-1 text-sm px-2 py-1.5 bg-gray-100 rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                    >
                      <Info size={15} />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => onLoadRoute(route.id)}
                      className="flex-1 text-sm px-2 py-1.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 flex items-center justify-center gap-1"
                    >
                      <RefreshCw size={15} />
                      <span>Load</span>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Sidebar;