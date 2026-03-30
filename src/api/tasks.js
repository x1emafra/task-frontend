import axios from "axios";

const API = axios.create({
  baseURL: "https://task-api-emanuel.onrender.com/api",
});

export const getTasks = async (userId) => {
  const res = await API.get("/tasks", {
    params: { userId },
  });
  return res.data;
};

export const createTask = async (data) => {
  const res = await API.post("/tasks", data);
  return res.data;
};

export const updateTask = async (id, data) => {
  const res = await API.put(`/tasks/${id}`, data);
  return res.data;
};

export const deleteTask = async (id, userId) => {
  const res = await API.delete(`/tasks/${id}`, {
    params: { userId },
  });
  return res.data;
};

export const shareTask = async (data) => {
  const res = await API.post("/tasks/share", data);
  return res.data;
};