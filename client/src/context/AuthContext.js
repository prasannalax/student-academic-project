import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          console.error('Failed to verify token:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', {
      identifier,
      email: identifier,
      rollNumber: identifier,
      password,
    });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    return user;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (formData) => {
    const res = await api.put('/auth/profile', formData);
    setUser(res.data.user);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
