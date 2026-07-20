import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://bizbitenow-backend.onrender.com/api",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

// Reads the token from the Zustand-persisted auth store (see src/store/authStore.js),
// avoiding a circular import while keeping a single source of truth for the token.
function getStoredToken() {
  try {
    const raw = localStorage.getItem("bizbite-auth");
    return raw ? JSON.parse(raw)?.state?.token || null : null;
  } catch {
    return null;
  }
}

// Request Interceptor
API.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("bizbite-auth");
    }

    return Promise.reject(error);
  },
);

export default API;
