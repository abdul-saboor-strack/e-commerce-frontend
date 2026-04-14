import axios from "axios";

// Single API client for the whole app.
// Using proxy setup: frontend on 5173, backend on 5173, API calls proxied.
// If VITE_API_URL is provided, it will be used.
const baseURL = (import.meta as any).env?.VITE_API_URL || "/api";

const API = axios.create({
  baseURL,
  withCredentials: true,
});

// Track if we're already refreshing token to avoid multiple refresh requests
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

// Attach admin or user token if present
API.interceptors.request.use((config) => {
  const adminToken = sessionStorage.getItem("adminToken");
  const userToken = localStorage.getItem("token");
  if (adminToken) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${adminToken}`;
  } else if (userToken) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${userToken}`;
  }
  return config;
});

// Handle token refresh on 401 errors
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const adminRefreshToken = sessionStorage.getItem("adminRefreshToken");

    // Handle 401 errors - try to refresh token
    if (error.response?.status === 401 && adminRefreshToken && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return API(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${baseURL}/auth/admin/refresh`, { refreshToken: adminRefreshToken });
        const { token } = response.data;

        // Update stored token in sessionStorage
        sessionStorage.setItem("adminToken", token);

        // Update authorization header
        API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        originalRequest.headers.Authorization = `Bearer ${token}`;

        processQueue(null, token);
        return API(originalRequest);
      } catch (err) {
        // Refresh failed - clear tokens and redirect to login
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminRefreshToken");
        localStorage.removeItem("admin_name");
        localStorage.removeItem("admin_email");

        processQueue(err, null);

        // Redirect to admin login if we're on admin pages
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        }

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;