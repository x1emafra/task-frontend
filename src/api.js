import axios from "axios";

const API = axios.create({
  baseURL: "https://task-api-emanuel.onrender.com/api",
});

export const getTasks = (userId) => {
  return API.get(`/tasks?userId=${userId}`);
};

export const createTask = (data) => {
  return API.post("/tasks", data);
};

export const updateTask = (id, data) => {
  return API.put(`/tasks/${id}`, data);
};

export const deleteTask = (id) => {
  return API.delete(`/tasks/${id}`);
};