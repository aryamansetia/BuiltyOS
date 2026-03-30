import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const validationMessage = error.response?.data?.errors?.[0]?.message;
    const message = validationMessage || error.response?.data?.message || error.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
