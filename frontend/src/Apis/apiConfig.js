import axios from "axios";
import { getAccessToken, clearAuthUser } from "../Utils/Auth";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      clearAuthUser();

      if (window.location.pathname !== "/auth/login-register") {
        window.location.href = "/auth/login-register";
      }
    }

    return Promise.reject(error);
  }
);

const api = {
  get: (endpoint, params = {}, config = {}) =>
    axiosInstance
      .get(endpoint, {
        params,
        ...config,
      })
      .then((res) => res.data),

  post: (endpoint, data = {}, config = {}) =>
    axiosInstance.post(endpoint, data, config).then((res) => res.data),

  put: (endpoint, data = {}, config = {}) =>
    axiosInstance.put(endpoint, data, config).then((res) => res.data),

  patch: (endpoint, data = {}, config = {}) =>
    axiosInstance.patch(endpoint, data, config).then((res) => res.data),

  delete: (endpoint, params = {}, config = {}) =>
    axiosInstance
      .delete(endpoint, {
        params,
        ...config,
      })
      .then((res) => res.data),

  postFormData: (endpoint, formData, config = {}) =>
    axiosInstance
      .post(endpoint, formData, {
        ...config,
        headers: {
          ...(config.headers || {}),
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data),
};

export default api;
export { axiosInstance };