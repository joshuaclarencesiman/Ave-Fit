import axios from "axios";

const userApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/user`
});

userApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("avefit_user_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default userApi;