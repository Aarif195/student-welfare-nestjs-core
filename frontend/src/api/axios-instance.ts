import axios from 'axios';

export const AXIOS_INSTANCE = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor logic
AXIOS_INSTANCE.interceptors.request.use((config) => {
  // Check storage for whichever token is active for the current session context
  const roles = ['student', 'hostelOwner', 'superadmin'];
  let token = null;

  for (const role of roles) {
    const activeToken = localStorage.getItem(`${role}_token`);
    if (activeToken) {
      token = activeToken;
      break;
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to catch errors
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const roles = ['student', 'hostelOwner', 'superadmin'];
      roles.forEach((role) => {
        localStorage.removeItem(`${role}_token`);
        localStorage.removeItem(`${role}_user`);
      });

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const customInstance = <T>(config: any): Promise<T> => {
  return AXIOS_INSTANCE(config).then((response) => response.data);
};