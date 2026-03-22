import { useEffect, useState } from "react";
import { getTasks, createTask, deleteTask, updateTask } from "./api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const loadTasks = async () => {
    try {
      const res = await getTasks();
      console.log("TASKS:", res.data);
      setTasks(res.data);
    } catch (error) {
      console.error("ERROR CARGANDO TASKS:", error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAdd = async () => {
    if (!title.trim()) return;

    try {
      console.log("CREANDO:", title);
      await createTask({ title });
      setTitle("");
      loadTasks();
    } catch (error) {
      console.error("ERROR CREANDO:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      console.log("DELETE:", id);
      await deleteTask(id);
      loadTasks();
    } catch (error) {
      console.error("ERROR DELETE:", error);
    }
  };

  const toggleComplete = async (task) => {
    try {
      console.log("UPDATE:", task);
      await updateTask(task.id, {
        ...task,
        completed: !task.completed,
      });
      loadTasks();
    } catch (error) {
      console.error("ERROR UPDATE:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex justify-center p-10">
      <div className="w-full max-w-xl">
        
        <h1 className="text-4xl font-bold mb-8 text-center">
          🚀 Task App
        </h1>

        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 p-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nueva tarea..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 px-5 rounded-xl hover:bg-blue-700 transition"
          >
            +
          </button>
        </div>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-gray-400 text-center">
              No hay tareas aún 👀
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex justify-between items-center bg-gray-800 p-4 rounded-xl shadow-md hover:bg-gray-700 transition"
              >
                <span
                  onClick={() => toggleComplete(task)}
                  className={`cursor-pointer ${
                    task.completed
                      ? "line-through text-gray-400"
                      : ""
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
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default App;