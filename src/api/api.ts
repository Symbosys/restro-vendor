import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate, triggerLogout } from '../helpers/navigationService';

import { API_BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('vendorToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle Unauthorized Globally
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('⛔ Unauthorized — logging out');

      await triggerLogout();   // 🔥 no hook used
      navigate('Login');       // 🔥 global navigation
    }

    return Promise.reject(error);
  }
);

export default api;
