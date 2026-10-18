import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('careerforge_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('careerforge_token');
          setToken('');
          setUser(null);
        } else {
          console.error('Unable to verify the current session:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('careerforge_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('careerforge_token');
    setToken('');
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, loading, login, register, logout }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
