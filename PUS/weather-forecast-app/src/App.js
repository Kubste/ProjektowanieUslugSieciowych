import React, { useState, useEffect } from 'react';
import WeatherCard from './components/WeatherCard.js';
import Sidebar from './components/Sidebar';
import SearchPanel from './components/SearchPanel';
import RouteModal from './components/RouteModal';
import { Menu, X, User, Save, Plus, MapPin } from 'lucide-react';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedCities, setSelectedCities] = useState([]);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [savingRoute, setSavingRoute] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (profileOpen) setProfileOpen(false);
  };
  
  // Toggle profile menu
  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
    if (sidebarOpen) setSidebarOpen(false);
  };
  
  // Add city to selection
  const addCity = (cityWithDates) => {
    // Check if there are existing cities and ensure chronological order
    if (selectedCities.length > 0) {
      const lastCity = selectedCities[selectedCities.length - 1];
      const lastDeparture = new Date(lastCity.departureDate);
      const newArrival = new Date(cityWithDates.arrivalDate);
      
      // If new arrival is before last departure, adjust it
      if (newArrival < lastDeparture) {
        // Set arrival to same day as last departure
        cityWithDates.arrivalDate = lastCity.departureDate;
        
        // If departure is now before arrival, set it to same as arrival
        const newDeparture = new Date(cityWithDates.departureDate);
        if (newDeparture < new Date(cityWithDates.arrivalDate)) {
          cityWithDates.departureDate = cityWithDates.arrivalDate;
        }
      }
    }
    
    setSelectedCities([...selectedCities, cityWithDates]);
  };
  
  // Remove city from selection
  const removeCity = (cityId) => {
    setSelectedCities(selectedCities.filter(city => city.id !== cityId));
  };
  
  // Open save route modal
  const openSaveRouteModal = () => {
    if (selectedCities.length === 0) return;
    setRouteName(`Route ${savedRoutes.length + 1}`);
    setSavingRoute(true);
  };
  
  // Save current cities as a route
  const saveRoute = () => {
    if (selectedCities.length === 0 || !routeName.trim()) return;
    
    const newRoute = {
      id: Date.now(),
      name: routeName.trim(),
      cities: [...selectedCities]
    };
    
    setSavedRoutes([...savedRoutes, newRoute]);
    setSavingRoute(false);
    setRouteName('');
  };
  
  // Cancel save route
  const cancelSaveRoute = () => {
    setSavingRoute(false);
    setRouteName('');
  };
  
  // Load a saved route
  const loadRoute = (routeId) => {
    const route = savedRoutes.find(r => r.id === routeId);
    if (route) {
      setSelectedCities([...route.cities]);
      setSidebarOpen(false);
    }
  };
  
  // Open route details modal
  const openRouteDetails = (routeId) => {
    const route = savedRoutes.find(r => r.id === routeId);
    if (route) {
      setSelectedRoute(route);
      setRouteModalOpen(true);
    }
  };
  
  // Rename route
  const renameRoute = (routeId, newName) => {
    const updatedRoutes = savedRoutes.map(route => 
      route.id === routeId ? { ...route, name: newName } : route
    );
    setSavedRoutes(updatedRoutes);
    
    // Update selected route if it's the one being renamed
    if (selectedRoute && selectedRoute.id === routeId) {
      setSelectedRoute({ ...selectedRoute, name: newName });
    }
  };
  
  // Open delete confirmation
  const confirmDeleteRoute = (routeId) => {
    setRouteToDelete(routeId);
    setDeleteConfirmOpen(true);
    // Close route modal if open
    if (routeModalOpen && selectedRoute && selectedRoute.id === routeId) {
      setRouteModalOpen(false);
    }
  };
  
  // Delete route
  const deleteRoute = () => {
    if (!routeToDelete) return;
    
    const updatedRoutes = savedRoutes.filter(route => route.id !== routeToDelete);
    setSavedRoutes(updatedRoutes);
    
    // Reset states
    setDeleteConfirmOpen(false);
    setRouteToDelete(null);
    
    // If the deleted route was selected, clear selection
    if (selectedRoute && selectedRoute.id === routeToDelete) {
      setSelectedRoute(null);
    }
  };
  
  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setRouteToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for saved routes */}
      <Sidebar 
        isOpen={sidebarOpen} 
        savedRoutes={savedRoutes}
        onLoadRoute={loadRoute}
        onViewRouteDetails={openRouteDetails}
        onDeleteRoute={confirmDeleteRoute}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <h1 className="text-xl font-medium">Weather app</h1>
          
          <div className="relative">
            <button 
              onClick={toggleProfile}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <User size={24} />
            </button>
            
            {/* Profile dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <a href="#profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Profile
                </a>
                <a href="#settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Settings
                </a>
                <a href="#logout" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Log out
                </a>
              </div>
            )}
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weather cards column */}
            <div className="space-y-4 max-h-screen overflow-y-auto pb-20">
              {selectedCities.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-500">No cities selected yet. Use the search panel to add cities.</p>
                </div>
              ) : (
                selectedCities.map(city => (
                  <WeatherCard 
                    key={city.id} 
                    city={city}
                    onRemove={() => removeCity(city.id)}
                  />
                ))
              )}
              
              {/* Save route button */}
              {selectedCities.length > 0 && (
                <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-1/2 md:mr-2 md:translate-x-0 transform translate-x-0">
                  <button
                    onClick={openSaveRouteModal}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg shadow-md flex items-center justify-center"
                  >
                    <Save size={20} className="mr-2" />
                    Save Route
                  </button>
                </div>
              )}
            </div>
            
            {/* Search panel column */}
            <div className="bg-gray-100 rounded-lg">
            <SearchPanel 
                onAddCity={addCity} 
                lastDepartureDate={selectedCities.length > 0 ? selectedCities[selectedCities.length - 1].departureDate : null}
              />
            </div>
          </div>
        </main>
      </div>
      
      {/* Save Route Modal */}
      {savingRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Save Route</h2>
            
            <div className="mb-4">
              <label htmlFor="routeName" className="block text-sm font-medium text-gray-700 mb-1">
                Route Name
              </label>
              <input
                type="text"
                id="routeName"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter a name for this route"
                autoFocus
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelSaveRoute}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveRoute}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!routeName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Route Details Modal */}
      {routeModalOpen && selectedRoute && (
        <RouteModal
          route={selectedRoute}
          onClose={() => setRouteModalOpen(false)}
          onRename={renameRoute}
          onDelete={() => confirmDeleteRoute(selectedRoute.id)}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-2">Delete Route</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this route? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={deleteRoute}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;