import { supabase } from "../supabase";

export const taskService = {
  async fetchTasks(userId) {
    const { data, error } = await supabase
      .from("Task")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addTask(title, userId) {
    const { data, error } = await supabase
      .from("Task")
      .insert([
        {
          title,
          completed: false,
          user_id: userId,
        },
      ])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async deleteTask(id) {
    const { error } = await supabase.from("Task").delete().eq("id", id);
    if (error) throw error;
  },

  async toggleTask(id, completed) {
    const { error } = await supabase
      .from("Task")
      .update({ completed })
      .eq("id", id);

    if (error) throw error;
  },

  async shareTask(taskId, email) {
    const { error } = await supabase.from("shared_tasks").insert([
      {
        task_id: taskId,
        user_email: email,
      },
    ]);

    if (error) throw error;
  },

  async reorderTasks(updates) {
    const { error } = await supabase.from("Task").upsert(updates);
    if (error) throw error;
  },
};
