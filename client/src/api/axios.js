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

// If a request that carried our token comes back 401, the token is expired/invalid rather
// than the credentials being wrong (a plain login attempt never has this header set) — clear
// the stale session and send the user back to log in instead of leaving pages silently broken.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      localStorage.removeItem('userInfo');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
