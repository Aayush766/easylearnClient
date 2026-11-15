import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, ""),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

let accessToken = null;
export function setAccessToken(token) { accessToken = token || null; }
export function getAccessToken() { return accessToken; }
api.interceptors.request.use((request) => {
  if (accessToken) request.headers.Authorization = `Bearer ${accessToken}`;
  return request;
});
api.interceptors.response.use((response) => response.data?.data ?? response.data, (error) => {
  const result = new Error(error.response?.data?.message || error.message || "The service is unavailable.");
  result.status = error.response?.status;
  result.code = error.response?.data?.code;
  return Promise.reject(result);
});

export default api;
