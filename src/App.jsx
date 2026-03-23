import { useEffect, useState } from "react";
import { getTasks, createTask, deleteTask, updateTask } from "./api";
import { supabase } from "./supabase";
import Auth from "./Auth";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [user, setUser] = useState(null);

  // 🔐 Obtener sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });
  }, []);

  // 🔐 Si no hay usuario → login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Auth />
      </div>
    );
  }

  // 📦 Cargar tareas del usuario
  const loadTasks = async () => {
    try {
      const res = await getTasks(user.id);
      setTasks(res.data);
    } catch (error) {
      console.error("Error cargando tareas:", error);
    }
  };

  useEffect(() => {
    if (user) loadTasks();
  }, [user]);

  // ➕ Crear tarea
  const handleAdd = async () => {
    if (!title.trim()) return;

    try {
      await createTask({
        title,
        userId: user.id, // 🔥 clave multiusuario
      });

      setTitle("");
      loadTasks();
    } catch (error) {
      console.error("Error creando tarea:", error);
    }
  };

  // ❌ Eliminar
  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      loadTasks();
    } catch (error) {
      console.error("Error eliminando:", error);
    }
  };

  // ✔ Toggle
  const handleToggle = async (task) => {
    try {
      await updateTask(task.id, {
        ...task,
        completed: !task.completed,
      });
      loadTasks();
    } catch (error) {
      console.error("Error actualizando:", error);
    }
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
            className="text-sm bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
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
            className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleAdd}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
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
              className="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              {/* IZQUIERDA */}
              <div
                onClick={() => handleToggle(task)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center ${
                    task.completed
                      ? "bg-green-500 border-green-500"
                      : "border-gray-500"
                  }`}
                >
                  {task.completed && "✓"}
                </div>

                <span
                  className={`${
                    task.completed
                      ? "line-through text-gray-500"
                      : ""
                  }`}
                >
                  {task.title}
                </span>
              </div>

              {/* DELETE */}
              <button
                onClick={() => handleDelete(task.id)}
                className="text-red-400 hover:text-red-600 transition"
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