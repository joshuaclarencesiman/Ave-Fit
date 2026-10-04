import axios from "axios";
import { getUserAuthToken, USER_TOKEN_KEY } from "./context/userAuthStorage";

const userApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/user`
});

userApi.interceptors.request.use((config) => {
  const token = getUserAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default userApi;

// Expired/revoked sessions are removed immediately so the next protected
// navigation cannot keep using a stale credential.
userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      sessionStorage.removeItem(USER_TOKEN_KEY);
      localStorage.removeItem(USER_TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);
