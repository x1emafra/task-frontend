import { useEffect, useState } from "react";
import { getTasks, createTask, deleteTask, updateTask } from "./api";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const loadTasks = async () => {
    const res = await getTasks();
    setTasks(res.data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAdd = async () => {
    if (!title.trim()) return;
    await createTask({ title });
    setTitle("");
    loadTasks();
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    loadTasks();
  };

  const handleToggle = async (task) => {
    await updateTask(task.id, {
      ...task,
      completed: !task.completed,
    });
    loadTasks();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl">

        {/* HEADER */}
        <h1 className="text-4xl font-bold text-center mb-2">
          🚀 Task App
        </h1>

        <p className="text-center text-gray-400 mb-6">
          Gestiona tus tareas de forma simple y rápida
        </p>

        {/* CONTADOR */}
        <p className="text-gray-400 text-sm mb-2">
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
              No hay tareas aún 👀
            </p>
          )}

          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              {/* IZQUIERDA */}
              <div className="flex items-center gap-3">

                {/* CHECKBOX */}
                <div
                  onClick={() => handleToggle(task)}
                  className={`w-5 h-5 rounded border cursor-pointer flex items-center justify-center ${
                    task.completed
                      ? "bg-green-500 border-green-500"
                      : "border-gray-500"
                  }`}
                >
                  {task.completed && "✓"}
                </div>

                {/* TEXTO */}
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

              {/* BOTÓN DELETE */}
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