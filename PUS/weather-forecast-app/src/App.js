import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import WeatherApp from './WeatherApp';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

function AppWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth_manager/api/user/');
        if (response.data.is_authenticated) {
          setIsAuthenticated(true);
          setUser({ username: response.data.username });
        }
      } catch (err) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const response = await api.post('/auth_manager/login/', credentials);
      if (response.data.status === 'success') {
        setIsAuthenticated(true);
        setUser({ username: response.data.username });
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed' 
      };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await api.post('/auth_manager/register/', userData);
      if (response.data.status === 'success') {
        setIsAuthenticated(true);
        setUser({ username: response.data.username });
        return { success: true };
      }
      return { success: false, errors: response.data.errors };
    } catch (err) {
      return { 
        success: false, 
        errors: err.response?.data?.errors || { general: 'Registration failed' }
      };
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth_manager/logout/');
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? 
            <LoginPage onLogin={handleLogin} /> : 
            <Navigate to="/app" replace />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? 
            <RegisterPage onRegister={handleRegister} /> : 
            <Navigate to="/app" replace />} 
        />
        <Route 
          path="/app/*" 
          element={isAuthenticated ? 
            <WeatherApp api={api} user={user} onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />} 
        />
        <Route 
          path="/" 
          element={
            <Navigate to={isAuthenticated ? "/app" : "/login"} replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default AppWrapper;