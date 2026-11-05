import {
  AUTH_STORAGE_KEYS,
  clearStoredAuth,
} from "./authStorage.js";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5001";

export const UNAUTHORIZED_EVENT = "voxliva:unauthorized";
export const TOKEN_KEY = AUTH_STORAGE_KEYS.token;

async function apiRequest(endpoint, options = {}) {
  const token =
    localStorage.getItem(AUTH_STORAGE_KEYS.token);

  const headers = {
    ...(options.headers || {}),
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && !options.skipAuthHandler) {
      clearStoredAuth();
      window.dispatchEvent(
        new CustomEvent(UNAUTHORIZED_EVENT)
      );
    }

    const error = new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.code = data?.code || null;
    error.data = data;
    throw error;
  }

  return data;
}

export {
  API_BASE_URL,
  apiRequest,
};

export default apiRequest;
