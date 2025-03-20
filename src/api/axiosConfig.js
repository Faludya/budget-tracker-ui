import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, 
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (userId) {
      config.headers["userId"] = userId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
