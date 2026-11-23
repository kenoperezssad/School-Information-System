// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('apex_token'));
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('apex_theme') === 'dark';
  });
  const [toasts, setToasts] = useState([]);

  // Apply dark mode class to html document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('apex_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('apex_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // ⚠️ IMPORTANT: logout MUST be declared BEFORE the fetchUser useEffect
  // because it is called inside the useEffect catch block.
  // const arrow functions are NOT hoisted — placing them after the useEffect
  // causes a ReferenceError (Temporal Dead Zone) at runtime.
  const logout = () => {
    localStorage.removeItem('apex_token');
    setToken(null);
    setUser(null);
    showToast('You have been signed out.', 'info');
  };

  // Fetch current user details if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          // Invalid or expired token — clear session
          logout();
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        // On network error (e.g. PHP server down), don't force logout.
        // Just stop loading so the user stays on the current page.
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('apex_token', newToken);
      setToken(newToken);
      setUser(userData);
      showToast(`Welcome back, ${userData.first_name || userData.username}!`, 'success');
      return userData;
    }
    throw new Error(res.message || 'Login failed.');
  };

  const switchRole = async (targetRole) => {
    try {
      const res = await api.post('/auth/switch-role', { role: targetRole });
      if (res.success && res.data) {
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('apex_token', newToken);
        setToken(newToken);
        setUser(userData);
        showToast(`Role switched to: ${userData.role}`, 'success');
        return userData;
      }
    } catch (err) {
      showToast(err.message || 'Failed to switch role', 'error');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      switchRole,
      darkMode,
      toggleDarkMode,
      toasts,
      dismissToast,
      showToast
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
