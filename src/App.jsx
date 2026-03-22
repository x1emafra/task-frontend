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
        <h1 className="text-4xl font-bold text-center mb-8">
          🚀 Task App
        </h1>

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
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            +
          </button>
        </div>

        {/* LIST */}
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
              <span
                onClick={() => handleToggle(task)}
                className={`cursor-pointer ${
                  task.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {task.title}
              </span>

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