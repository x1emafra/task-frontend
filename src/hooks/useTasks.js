import { useState, useCallback, useEffect } from "react";
import { taskService } from "../services/taskService";
import toast from "react-hot-toast";

export function useTasks(session, logger) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const { addLog, reportError, clearError } = logger;

  // 🔍 LOAD TASKS
  const loadTasks = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    addLog("📡 Fetching tasks", { userId: session.user.id });

    try {
      const data = await taskService.fetchTasks(session.user.id);
      addLog("✅ Tasks loaded", data?.length);
      setTasks(data);
      clearError();
    } catch (error) {
      reportError("loadTasks", error);
      toast.error("Error cargando tareas");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, addLog, reportError, clearError]);

  // Initial load
  useEffect(() => {
    if (session?.user?.id) {
      loadTasks();
    } else {
      setTasks([]);
    }
  }, [session?.user?.id, loadTasks]);

  // ➕ CREATE
  const handleAdd = async (selectedDate) => {
    if (!title.trim() || !session?.user?.id) {
      addLog("⚠️ Cannot create", { title, hasUser: !!session?.user });
      return;
    }

    const newTitle = title.trim();
    setTitle("");
    addLog("➕ Creating task", { title: newTitle });

    try {
      const taskDate = selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      await taskService.addTask(newTitle, session.user.id, taskDate);
      addLog("✅ Task created successfully", { date: taskDate });
      clearError();
      toast.success("Tarea creada");
      await loadTasks();
    } catch (error) {
      addLog("❌ Create error", error);
      reportError("handleAdd", error);
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
      await taskService.deleteTask(id);
      addLog("✅ Task deleted", id);
      toast.success("Tarea eliminada");
    } catch (error) {
      reportError("handleDelete", error);
      setTasks(previous);
      toast.error("Error al eliminar");
    }
  };

  // ✅ TOGGLE
  const handleToggle = async (task) => {
    const newStatus = !task.completed;
    addLog("🔘 Toggle task", { id: task.id, completed: newStatus });
    
    const previous = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: newStatus } : t))
    );

    try {
      await taskService.toggleTask(task.id, newStatus);
      addLog("✅ Toggle result: success");
    } catch (error) {
      reportError("handleToggle", error);
      setTasks(previous);
      toast.error("Error al actualizar");
    }
  };

  // 📤 SHARE
  const handleShare = async (taskId, email) => {
    addLog("📤 Sharing task", { taskId, email });
    try {
      await taskService.shareTask(taskId, email);
      addLog("✅ Share result: success");
      toast.success("Tarea compartida con " + email);
    } catch (error) {
      reportError("handleShare", error);
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

      await taskService.reorderTasks(updates);
      addLog("✅ Reorder success");
    } catch (error) {
      reportError("handleDragEnd", error);
      setTasks(previousTasks);
    }
  };

  return {
    tasks,
    title,
    setTitle,
    loading,
    handleAdd,
    handleDelete,
    handleToggle,
    handleShare,
    handleDragEnd,
    retryLoad: loadTasks,
  };
}