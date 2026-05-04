import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate, triggerLogout } from '../helpers/navigationService';

export const API_BASE_URL = "http://192.168.1.6:4000/api/v1/minta-fresh";
// export const API_BASE_URL = "https://api.mintafresh.com/api/v1/minta-fresh";

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
