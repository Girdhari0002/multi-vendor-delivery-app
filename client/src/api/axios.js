import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_API,
  withCredentials: true,
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
