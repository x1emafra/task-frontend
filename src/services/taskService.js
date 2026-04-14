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

  async addTask(title, userId, date) {
    const { data, error } = await supabase
      .from("Task")
      .insert([
        {
          title,
          completed: false,
          user_id: userId,
          date: date || new Date().toISOString().split('T')[0],
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
    try {
      const { data, error } = await supabase.functions.invoke("share-task", {
        body: {
          task_id: taskId,
          email: email
        }
      });

      if (error) {
        console.error("❌ FUNCTION ERROR:", error);
        throw error;
      }

      console.log("✅ SHARE RESULT:", data);
      return data;
      
    } catch (error) {
      console.error("❌ SHARE ERROR:", error);
      throw error;
    }
  },

  async reorderTasks(updates) {
    const { error } = await supabase.from("Task").upsert(updates);
    if (error) throw error;
  },
};
