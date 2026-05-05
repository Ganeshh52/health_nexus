const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = envBaseUrl
  ? trimTrailingSlash(envBaseUrl)
  : "http://localhost:8000";

export const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
