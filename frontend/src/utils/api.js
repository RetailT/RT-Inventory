import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// ── Attach token to every request ────────────────────────
api.interceptors.request.use(
  (config) => {
    const stored = sessionStorage.getItem("ims_user");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        if (userData?.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
        }
      } catch {
        // corrupted storage — ignore
      }
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// ── Handle global errors ──────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem("ims_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;