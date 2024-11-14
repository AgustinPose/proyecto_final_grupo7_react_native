// AuthContext.js
import { createContext, useContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const storeCredentials = async (token, userId) => {
    try {
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userId', userId);
      setToken(token);
      setUserId(userId);
    } catch (error) {
      console.error('Error storing credentials:', error);
    }
  };

  const clearCredentials = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userId');
      setToken(null);
      setUserId(null);
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, userId, storeCredentials, clearCredentials }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);