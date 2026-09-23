import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('entrio_token'));
  const [loading, setLoading] = useState(true);

  // On mount, if we have a token, fetch the current user
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getCurrentUser();
        setUser(res.data);
      } catch {
        // Token is invalid or expired
        localStorage.removeItem('entrio_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const login = async (phone, password) => {
    const res = await loginUser(phone, password);
    localStorage.setItem('entrio_token', res.token);
    setToken(res.token);
    setUser(res.data);
    return res;
  };

  const register = async (name, phone, password) => {
    const res = await registerUser(name, phone, password);
    localStorage.setItem('entrio_token', res.token);
    setToken(res.token);
    setUser(res.data);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('entrio_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
