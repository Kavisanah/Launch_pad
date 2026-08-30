import axios from 'axios';
import { BASE_URL } from '../utils/constants';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthMe = error.config && error.config.url && error.config.url.endsWith('/auth/me');
      if (window.location.pathname !== '/login' && !isAuthMe) {
        // Clear tokens on 401
        setAuthToken(null);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
