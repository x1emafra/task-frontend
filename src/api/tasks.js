import { Http } from '@capacitor-community/http';
import { supabase } from '../supabase';

const API_URL = 'https://task-api-emanuel.onrender.com/api';

/* =========================
   GET TASKS
========================= */
export const getTasks = async (userId) => {
  try {
    const response = await Http.get({
      url: `${API_URL}/tasks`,
      params: { userId }
    });

    return response.data;
  } catch (error) {
    console.error("GET ERROR:", error);
    throw error;
  }
};

/* =========================
   CREATE TASK
========================= */
export const createTask = async (data) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const response = await Http.post({
      url: `${API_URL}/tasks`,
      headers: { 'Content-Type': 'application/json' },
      data: {
        ...data,
        userId: user.id
      }
    });

    return response.data;
  } catch (error) {
    console.error("POST ERROR:", error);
    throw error;
  }
};

/* =========================
   UPDATE TASK
========================= */
export const updateTask = async (id, data) => {
  try {
    const response = await Http.put({
      url: `${API_URL}/tasks/${id}`,
      headers: { 'Content-Type': 'application/json' },
      data
    });

    return response.data;
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    throw error;
  }
};

/* =========================
   DELETE TASK
========================= */
export const deleteTask = async (id, userId) => {
  try {
    const response = await Http.del({
      url: `${API_URL}/tasks/${id}`,
      params: { userId }
    });

    return response.data;
  } catch (error) {
    console.error("DELETE ERROR:", error);
    throw error;
  }
};

/* =========================
   SHARE TASK
========================= */
export const shareTask = async (data) => {
  try {
    const response = await Http.post({
      url: `${API_URL}/tasks/share`,
      headers: { 'Content-Type': 'application/json' },
      data
    });

    return response.data;
  } catch (error) {
    console.error("SHARE ERROR:", error);
    throw error;
  }
};