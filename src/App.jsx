import { useEffect, useState } from "react";
import { getTasks, createTask, deleteTask, updateTask } from "./api";
import { supabase } from "./supabase";
import Auth from "./Auth";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [user, setUser] = useState(null);

  // 🔐 Sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });
  }, []);

  // 🔐 Si no está logueado
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Auth />
      </div>
    );
  }

  // 📦 Cargar tareas
  const loadTasks = async () => {
    const res = await getTasks();
    setTasks(res.data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // ➕ Crear
  const handleAdd = async () => {
    if (!title.trim()) return;
    await createTask({ title });
    setTitle("");
    loadTasks();
  };

  // ❌ Eliminar
  const handleDelete = async (id) => {
    await deleteTask(id);
    loadTasks();
  };

  // ✔ Toggle
  const handleToggle = async (task) => {
    await updateTask(task.id, {
      ...task,
      completed: !task.completed,
    });
    loadTasks();
  };

  // 🚪 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🚀 Task App</h1>

          <button
            onClick={handleLogout}
            className="text-sm bg-red-600 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>

        <p className="text-gray-400 mb-4">
          {tasks.length} tareas
        </p>

        {/* INPUT */}
        <div className="flex gap-2 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nueva tarea..."
            className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700"
          />
          <button
            onClick={handleAdd}
            className="px-5 py-3 bg-blue-600 rounded-lg"
          >
            Agregar
          </button>
        </div>

        {/* LISTA */}
        <div className="space-y-3">
          {tasks.length === 0 && (
            <p className="text-center text-gray-400">
              No hay tareas 👀
            </p>
          )}

          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex justify-between items-center bg-gray-800 p-3 rounded"
            >
              <div
                onClick={() => handleToggle(task)}
                className="cursor-pointer flex gap-2"
              >
                <span>
                  {task.completed ? "✅" : "⬜"}
                </span>

                <span
                  className={
                    task.completed ? "line-through text-gray-500" : ""
                  }
                >
                  {task.title}
                </span>
              </div>

              <button
                onClick={() => handleDelete(task.id)}
                className="text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}