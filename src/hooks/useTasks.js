import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";

export function useTasks() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]);

  // 📝 LOG HELPER
  const addLog = useCallback((msg, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${msg}${data ? ": " + JSON.stringify(data).substring(0, 100) : ""}`;
    console.log(entry);
    setDebugLogs((prev) => [entry, ...prev].slice(0, 20)); // Store last 20
  }, []);

  // 🔍 LOAD TASKS
  const loadTasks = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    addLog("📡 Fetching tasks", { userId });

    try {
      const { data, error } = await supabase
        .from("Task")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      addLog("✅ Tasks loaded", data?.length);
      setTasks(data || []);
      setLastError(null);
    } catch (error) {
      addLog("❌ Load tasks error", error);
      setLastError({ op: "loadTasks", error });
      toast.error("Error cargando tareas");
    } finally {
      setLoading(false);
    }
  }, [addLog]);

  // 🔐 AUTH & INITIALIZATION
  useEffect(() => {
    addLog("🚀 App mounting");

    const initSession = async () => {
      try {
        addLog("⏳ Checking session...");
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        addLog("👤 Session result", currentSession?.user?.email || "No session");
        setSession(currentSession);
        
        if (currentSession?.user) {
          await loadTasks(currentSession.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        addLog("❌ Session init error", error);
        setLastError({ op: "initSession", error });
        setLoading(false);
      }
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        addLog("🔔 Auth event", { event, email: currentSession?.user?.email });
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
  }, [loadTasks, addLog]);

  // ➕ CREATE
  const handleAdd = async () => {
    if (!title.trim() || !session?.user) {
      addLog("⚠️ Cannot create", { title, hasUser: !!session?.user });
      return;
    }

    const newTitle = title.trim();
    setTitle(""); 
    addLog("➕ Creating task (simple mode)", { title: newTitle });

    // Timeout log for debugging hangs
    const timeout = setTimeout(() => addLog("⌛ Task creation taking too long..."), 5000);

    try {
      const { error } = await supabase
        .from("Task")
        .insert([
          {
            title: newTitle,
            completed: false,
            user_id: session.user.id,
          },
        ]);

      clearTimeout(timeout);
      if (error) throw error;

      addLog("✅ Task created successfully");
      setLastError(null);
      toast.success("Tarea creada");
      
      // Re-fetch to update UI (safer than optimistic in some mobile environments)
      await loadTasks(session.user.id);
    } catch (error) {
      clearTimeout(timeout);
      addLog("❌ Create error", error);
      setLastError({ op: "handleAdd", error });
      setTitle(newTitle); 
      toast.error("Error al crear tarea");
    }
  };

  // 🗑️ DELETE
  const handleDelete = async (id) => {
    addLog("🗑️ Deleting task", id);
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      const { error } = await supabase.from("Task").delete().eq("id", id);
      if (error) throw error;
      addLog("✅ Task deleted", id);
      toast.success("Tarea eliminada");
    } catch (error) {
      addLog("❌ Delete error", error);
      setLastError({ op: "handleDelete", error });
      setTasks(previous);
      toast.error("Error al eliminar");
    }
  };

  // ✅ TOGGLE
  const handleToggle = async (task) => {
    addLog("🔘 Toggle task", { id: task.id, completed: !task.completed });
    const previous = tasks;
    const newStatus = !task.completed;

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: newStatus } : t))
    );

    try {
      const { error } = await supabase
        .from("Task")
        .update({ completed: newStatus })
        .eq("id", task.id);

      if (error) throw error;
      addLog("✅ Toggle result: success");
    } catch (error) {
      addLog("❌ Toggle error", error);
      setLastError({ op: "handleToggle", error });
      setTasks(previous);
      toast.error("Error al actualizar");
    }
  };

  // 📤 SHARE
  const handleShare = async (taskId, email) => {
    addLog("📤 Sharing task", { taskId, email });
    try {
      const { error } = await supabase.from("shared_tasks").insert([
        {
          task_id: taskId,
          user_email: email,
        },
      ]);

      if (error) throw error;
      addLog("✅ Share result: success");
      toast.success("Tarea compartida con " + email);
    } catch (error) {
      addLog("❌ Share error", error);
      setLastError({ op: "handleShare", error });
      toast.error("Error al compartir");
    }
  };

  // 🏗️ DRAG & DROP
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    addLog("🏗️ Drag end", { from: result.source.index, to: result.destination.index });

    const items = Array.from(tasks);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    const previousTasks = tasks;
    setTasks(items);

    try {
      const updates = items.map((item, index) => ({
        id: item.id,
        user_id: session.user.id,
        order: index,
        title: item.title,
        completed: item.completed,
      }));

      const { error } = await supabase.from("Task").upsert(updates);
      if (error) throw error;
      addLog("✅ Reorder success");
    } catch (error) {
      addLog("❌ Reorder error", error);
      setLastError({ op: "handleDragEnd", error });
    }
  };

  // 🚪 LOGOUT
  const handleLogout = async () => {
    addLog("🚪 Logout requested");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      addLog("✅ Logout success");
    } catch (error) {
      addLog("❌ Logout error", error);
      setLastError({ op: "logout", error });
      // Force local cleanup anyway
      localStorage.clear();
      setSession(null);
      setTasks([]);
    }
  };

  // 🧹 RESET
  const handleReset = async () => {
    addLog("🧹 Resetting app data...");
    localStorage.clear();
    try {
      await supabase.auth.signOut();
      addLog("✅ Sign out success");
    } catch (e) {
      addLog("⚠️ Sign out failed, reloading anyway", e);
    }
    window.location.reload();
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
    handleLogout,
    lastError,
    debugLogs,
    handleReset,
    retryLoad: () => session?.user && loadTasks(session.user.id),
  };
}