import axios, { AxiosInstance } from "axios";
import { config } from "./config.js";

export const http: AxiosInstance = axios.create({
  baseURL: config.baseUrl,
  timeout: config.timeoutMs,
  headers: { "Content-Type": "application/json" }
});

http.interceptors.request.use((request) => {
  if (config.token) request.headers.Authorization = `Bearer ${config.token}`;
  return request;
});

export function resolvePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}
