import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WeatherCard from './components/WeatherCard';
import Sidebar from './components/Sidebar';
import SearchPanel from './components/SearchPanel';
import RouteModal from './components/RouteModal';
import ErrorAlert from './components/ErrorAlert';
import { Menu, X, Save } from 'lucide-react';

function WeatherApp({ api, user, onLogout }) {
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
  const [citiesList, setCitiesList] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  // Pobierz listę miast przy pierwszym renderowaniu
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await api.get('/city/');
        setCitiesList(response.data);
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('Failed to load cities list');
      }
    };
    fetchCities();
  }, [api]);

  // Pobierz trasy użytkownika po zalogowaniu
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await api.get('/route/');
        setSavedRoutes(response.data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchRoutes();
  }, [api]);

    // Dodaj miasto do wybranej trasy
  const addCity = (cityWithDates) => {
    if (selectedCities.length > 0) {
      const lastCity = selectedCities[selectedCities.length - 1];
      const lastDeparture = new Date(lastCity.departureDate);
      const newArrival = new Date(cityWithDates.arrivalDate);
      
      if (newArrival < lastDeparture) {
        cityWithDates.arrivalDate = lastCity.departureDate;
        const newDeparture = new Date(cityWithDates.departureDate);
        if (newDeparture < new Date(cityWithDates.arrivalDate)) {
          cityWithDates.departureDate = cityWithDates.arrivalDate;
        }
      }
    }
    
    setSelectedCities([...selectedCities, cityWithDates]);
  };

  // Usuń miasto z wybranej trasy
  const removeCity = (cityId) => {
    setSelectedCities(selectedCities.filter(city => city.id !== cityId));
  };

    // Otwórz modal do zapisywania trasy
   const openSaveRouteModal = () => {
    if (selectedCities.length === 0) return;
    setRouteName(`Route ${savedRoutes.length + 1}`);
    setSavingRoute(true);
  };

  // Zapisz trasę
  const saveRoute = async () => {
    if (selectedCities.length === 0 || !routeName.trim()) return;
    
    try {
      // Najpierw tworzymy trasę
      const routeResponse = await api.post('/route/', {
        name: routeName.trim(),
        starts_at: selectedCities[0].arrivalDate,
        ends_at: selectedCities[selectedCities.length - 1].departureDate
      });
      
      // Następnie dodajemy miasta do trasy
      const routeId = routeResponse.data.id;
      await Promise.all(selectedCities.map(async (city, index) => {
        await api.post('/route_city/', {
            route: routeId,
            city: city.id,
            position: index + 1,
            arrival_date: city.arrivalDate,
            departure_date: city.departureDate // Poprawione z departureDate
          });
      }));
      
      // Aktualizujemy prognozę pogody
      await api.post(`/route/${routeId}/update_forecast/`);
      
      // Odświeżamy listę tras
      const routesResponse = await api.get('/route/');
      setSavedRoutes(routesResponse.data);
      
      setSavingRoute(false);
      setRouteName('');
    } catch (err) {
      console.error('Error saving route:', err);
      setError('Failed to save route');
    }
  };

  // Załaduj trasę
  const loadRoute = async (routeId) => {
    try {
      const response = await api.get(`/route/${routeId}/`);
      const routeCitiesResponse = await api.get(`/route_city/?route=${routeId}`);
      
      const citiesWithDates = routeCitiesResponse.data.map(rc => ({
        id: rc.city.id,
        city_name: rc.city.city_name,
        arrivalDate: rc.arrival_date,
        departureDate: rc.departure_date
      }));
      
      setSelectedCities(citiesWithDates);
      setSidebarOpen(false);
    } catch (err) {
      console.error('Error loading route:', err);
      setError('Failed to load route');
    }
  };

  // Usuń trasę
  const deleteRoute = async () => {
    if (!routeToDelete) return;
    
    try {
      await api.delete(`/route/${routeToDelete}/`);
      const updatedRoutes = savedRoutes.filter(route => route.id !== routeToDelete);
      setSavedRoutes(updatedRoutes);
      
      setDeleteConfirmOpen(false);
      setRouteToDelete(null);
      
      if (selectedRoute && selectedRoute.id === routeToDelete) {
        setSelectedRoute(null);
      }
    } catch (err) {
      console.error('Error deleting route:', err);
      setError('Failed to delete route');
    }
  };

  // Aktualizuj prognozę dla trasy
  const updateRouteForecast = async (routeId) => {
    try {
      await api.post(`/route/${routeId}/update_forecast/`);
      // Odśwież dane trasy
      const routesResponse = await api.get('/route/');
      setSavedRoutes(routesResponse.data);
      
      // Jeśli aktualna trasa jest otwarta, odśwież ją
      if (selectedRoute && selectedRoute.id === routeId) {
        const updatedRoute = routesResponse.data.find(r => r.id === routeId);
        setSelectedRoute(updatedRoute);
      }
    } catch (err) {
      console.error('Error updating forecast:', err);
      setError('Failed to update forecast');
    }
  };

  // Dodaj te funkcje do swojego komponentu App
const confirmDeleteRoute = (routeId) => {
  setRouteToDelete(routeId);
  setDeleteConfirmOpen(true);
  if (routeModalOpen && selectedRoute && selectedRoute.id === routeId) {
    setRouteModalOpen(false);
  }
};

const cancelSaveRoute = () => {
  setSavingRoute(false);
  setRouteName('');
};

const renameRoute = (routeId, newName) => {
  const updatedRoutes = savedRoutes.map(route => 
    route.id === routeId ? { ...route, name: newName } : route
  );
  setSavedRoutes(updatedRoutes);
  
  if (selectedRoute && selectedRoute.id === routeId) {
    setSelectedRoute({ ...selectedRoute, name: newName });
  }
};

const cancelDelete = () => {
  setDeleteConfirmOpen(false);
  setRouteToDelete(null);
};


  // Zamknij komunikat o błędzie
  const closeError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        savedRoutes={savedRoutes}
        onLoadRoute={loadRoute}
        onViewRouteDetails={(routeId) => {
          const route = savedRoutes.find(r => r.id === routeId);
          setSelectedRoute(route);
          setRouteModalOpen(true);
        }}
        onDeleteRoute={confirmDeleteRoute}
        onUpdateForecast={updateRouteForecast}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-100">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <h1 className="text-xl font-medium">Weather app</h1>
          
          <div className="flex items-center">
            <span className="mr-2">Hello, {user.username}</span>
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md"
            >
              Logout
            </button>
          </div>
        </header>
       
        {/* Error message */}
        {error && (
          <ErrorAlert message={error} onClose={closeError} />
        )}
        
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
                cities={citiesList}
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

export default WeatherApp;