import axios from "axios";

const API = axios.create({
  baseURL: "https://task-api-emanuel.onrender.com/api",
});

export const getTasks = (userId) =>
  API.get(`/tasks?userId=${userId}`);

export const createTask = (data) =>
  API.post("/tasks", data);

export const updateTask = (id, data) =>
  API.put(`/tasks/${id}`, data);

export const deleteTask = (id, userId) =>
  API.delete(`/tasks/${id}?userId=${userId}`);

export const shareTask = (data) =>
  API.post("/tasks/share", data);