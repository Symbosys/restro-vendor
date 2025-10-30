import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://10.49.92.106:4000/api/v1/minta-fresh',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Attach token before each request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('vendorToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
