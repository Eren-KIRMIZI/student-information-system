import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance, { setAccessToken } from '../api/axiosInstance';
import { connectSocket, disconnectSocket } from '../lib/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .post('/auth/refresh')
      .then(({ data }) => {
        setAccessToken(data.data.accessToken);
        connectSocket();
        return axiosInstance.get('/users/me');
      })
      .then(({ data }) => setUser(data.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    setAccessToken(data.data.accessToken);
    connectSocket();
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      disconnectSocket();
      setAccessToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  return <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
