import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin as apiLogin, getAdminProfile } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('rajpatra_admin_data');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('rajpatra_admin_token') || null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('rajpatra_admin_token');
      if (storedToken) {
        try {
          const res = await getAdminProfile();
          if (res.success && res.admin) {
            setAdmin(res.admin);
            localStorage.setItem('rajpatra_admin_data', JSON.stringify(res.admin));
          }
        } catch (err) {
          console.warn('[Auth] Session expired or invalid');
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    if (res.success && res.token) {
      setToken(res.token);
      setAdmin(res.admin);
      localStorage.setItem('rajpatra_admin_token', res.token);
      localStorage.setItem('rajpatra_admin_data', JSON.stringify(res.admin));
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('rajpatra_admin_token');
    localStorage.removeItem('rajpatra_admin_data');
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: Boolean(token),
        loading,
        login,
        logout,
      }}
    >
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
