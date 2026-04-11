import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";

export function useTasks() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState(null);

  // 🔐 AUTH & INITIALIZATION
  useEffect(() => {
    // 1. Check current session on mount
    const initSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("🔄 Initial session check:", currentSession?.user?.email);
        setSession(currentSession);
        if (currentSession?.user) {
          await loadTasks(currentSession.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Session init error:", error);
        setLoading(false);
      }
    };

    initSession();

    // 2. Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("🔔 Auth event:", event, currentSession?.user?.email);
        setSession(currentSession);

        if (currentSession?.user) {
          await loadTasks(currentSession.user.id);
        } else {
          setTasks([]);
          setLoading(false);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // 🔍 LOAD TASKS
  const loadTasks = async (userId) => {
    if (!userId) return;
    setLoading(true);
    console.log("📡 Fetching tasks for:", userId);

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      console.log("✅ Tasks loaded:", data?.length || 0);
      setTasks(data || []);
    } catch (error) {
      console.error("❌ Load tasks error:", error);
      setLastError({ op: "loadTasks", error });
      toast.error("Error cargando tareas");
    } finally {
      setLoading(false);
    }
  };

  // ➕ CREATE
  const handleAdd = async () => {
    if (!title.trim() || !session?.user) return;

    const newTitle = title.trim();
    setTitle(""); // Optimistic clear

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            title: newTitle,
            completed: false,
            user_id: session.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setTasks((prev) => [...prev, data]);
      setLastError(null);
      toast.success("Tarea creada");
    } catch (error) {
      console.error("❌ Create error:", error);
      setLastError({ op: "handleAdd", error });
      setTitle(newTitle); // Restore on error
      toast.error("Error al crear tarea");
    }
  };

  // 🗑️ DELETE
  const handleDelete = async (id) => {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      toast.success("Tarea eliminada");
    } catch (error) {
      console.error("❌ Delete error:", error);
      setTasks(previous);
      toast.error("Error al eliminar");
    }
  };

  // ✅ TOGGLE
  const handleToggle = async (task) => {
    const previous = tasks;
    const newStatus = !task.completed;

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: newStatus } : t))
    );

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: newStatus })
        .eq("id", task.id);

      if (error) throw error;
    } catch (error) {
      console.error("❌ Toggle error:", error);
      setTasks(previous);
      toast.error("Error al actualizar");
    }
  };

  // 📤 SHARE
  const handleShare = async (taskId, email) => {
    try {
      // Asumimos tabla 'shared_tasks' con task_id y user_email
      const { error } = await supabase.from("shared_tasks").insert([
        {
          task_id: taskId,
          user_email: email,
        },
      ]);

      if (error) throw error;
      toast.success("Tarea compartida con " + email);
    } catch (error) {
      console.error("❌ Share error:", error);
      toast.error("Error al compartir");
    }
  };

  // 🏗️ DRAG & DROP
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    const previousTasks = tasks;
    setTasks(items);

    try {
      // Aktualiza el orden en Supabase (si existe columna 'order')
      // Si no existe, esto fallará silenciosamente o dará error en consola
      const updates = items.map((item, index) => ({
        id: item.id,
        user_id: session.user.id,
        order: index,
        title: item.title,
        completed: item.completed,
      }));

      const { error } = await supabase.from("tasks").upsert(updates);
      if (error) throw error;
    } catch (error) {
      console.error("❌ Reorder error:", error);
      // No revertimos aquí por UX, pero informamos si es crítico
    }
  };

  return {
    session,
    tasks,
    title,
    setTitle,
    loading,
    handleAdd,
    handleDelete,
    handleToggle,
    handleShare,
    handleDragEnd,
    lastError,
  };
}