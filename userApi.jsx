import axios from "axios";

const userApi = axios.create({ baseURL: "http://localhost:5000/api/user" });

userApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("avefit_user_token");
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
    if (status === 401 || status === 403) sessionStorage.removeItem("avefit_user_token");
    return Promise.reject(error);
  }
);
