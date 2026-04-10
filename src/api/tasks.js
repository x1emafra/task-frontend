import { CapacitorHttp } from '@capacitor/core';
import { supabase } from '../supabase';

const API_URL = 'https://task-api-emanuel.onrender.com/api';

/* =========================
   GET TASKS
========================= */
export const getTasks = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

/* =========================
   CREATE TASK
========================= */
export const createTask = async ({ title }) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          title,
          completed: false,
          user_id: user.id,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ INSERT ERROR:", error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error("❌ CREATE ERROR:", error);
    throw error;
  }
};

/* =========================
   UPDATE TASK
========================= */
export const updateTask = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("❌ UPDATE ERROR:", error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error("❌ UPDATE FAILED:", error);
    throw error;
  }
};

/* =========================
   DELETE TASK
========================= */
export const deleteTask = async (id) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("❌ DELETE ERROR:", error);
      throw error;
    }

    return true;

  } catch (error) {
    console.error("❌ DELETE FAILED:", error);
    throw error;
  }
};

/* =========================
   SHARE TASK
========================= */
export const shareTask = async (data) => {
  try {
    const response = await CapacitorHttp.post({
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