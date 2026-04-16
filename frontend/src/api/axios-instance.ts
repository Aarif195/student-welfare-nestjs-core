import axios from 'axios';

export const AXIOS_INSTANCE = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor logic
AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const customInstance = <T>(config: any): Promise<T> => {
  return AXIOS_INSTANCE(config).then((response) => response.data);
};