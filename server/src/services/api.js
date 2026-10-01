import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Attach JWT token to every request automatically
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("avefit_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const loginAdmin = (email, password) =>
  api.post("/admin/login", { email, password });

// Members
export const getMembers = () => api.get("/members");
export const getMemberById = (id) => api.get(`/members/${id}`);
export const approveMember = (id) => api.put(`/members/${id}/approve`);
export const rejectMember = (id) => api.put(`/members/${id}/reject`);

// Workouts
export const getWorkoutPlans = () => api.get("/workouts");
export const createWorkoutPlan = (data) => api.post("/workouts", data);

// Nutrition
export const getNutritionPlans = () => api.get("/nutrition");

export default api;