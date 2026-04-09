import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
  shareTask,
} from "../api/tasks";
import toast from "react-hot-toast";

export function useTasks() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // AUTH
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);

        if (session?.user?.id) {
          await loadTasks();
        } else {
          setTasks([]);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // LOAD TASKS
  const loadTasks = async () => {
    setLoading(true);
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user.id;

      const data = await getTasks(userId); // 👈 ahora correcto
      setTasks(data);

    } catch (error) {
      console.error(error);
      toast.error("Error cargando tareas");
    } finally {
      setLoading(false);
    }
  };

  // CREATE
  const handleAdd = async () => {
    if (!title.trim()) return;

    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user.id;

      const created = await createTask({
        title,
        completed: false,
        user_id: userId,
      });

      setTasks((prev) => [...prev, created]);
      setTitle("");
      toast.success("Tarea creada");

    } catch (error) {
      console.error(error);
      toast.error("Error creando");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTask(id);
      toast.success("Eliminada");
    } catch (error) {
      console.error(error);
      setTasks(previous);
      toast.error("Error eliminando");
    }
  };

  // TOGGLE
  const handleToggle = async (task) => {
    const previous = tasks;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, completed: !task.completed } : t
      )
    );

    try {
      await updateTask(task.id, { completed: !task.completed });
    } catch (error) {
      console.error(error);
      setTasks(previous);
      toast.error("Error actualizando");
    }
  };

  // SHARE
  const handleShare = async (taskId, email) => {
    try {
      await shareTask({ taskId, email });
      toast.success("Compartido");
    } catch (error) {
      console.error(error);
      toast.error("Usuario no encontrado");
    }
  };

  // DRAG & DROP
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const previousTasks = tasks;
    const items = Array.from(tasks);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setTasks(items);

    try {
      await Promise.all(
        items.map((item, index) =>
          updateTask(item.id, { order: index })
        )
      );
    } catch (error) {
      console.error(error);
      setTasks(previousTasks);
      toast.error("Error reordenando");
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
  };
}