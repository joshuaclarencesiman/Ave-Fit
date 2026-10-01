import axios from "axios";

const trainerApi = axios.create({ baseURL: "http://localhost:5000/api/trainers" });

trainerApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("avefit_trainer_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default trainerApi;
