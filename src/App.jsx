import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { getTasks, createTask, deleteTask } from "./api";
import Auth from "./Auth";

function App() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadTasks(data.session.user.id);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadTasks(session.user.id);
      else setTasks([]);
    });
  }, []);

  const loadTasks = async (userId) => {
    try {
      const res = await getTasks(userId);
      setTasks(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async () => {
    if (!title) return;

    await createTask({
      title,
      userId: session.user.id,
    });

    setTitle("");
    loadTasks(session.user.id);
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    loadTasks(session.user.id);
  };

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex justify-center items-start pt-16">

      <div className="w-full max-w-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🚀 Task App</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>

        {/* INPUT */}
        <div className="flex gap-2 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nueva tarea..."
            className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 px-5 rounded-xl"
          >
            +
          </button>
        </div>

        {/* LISTA */}
        <div className="space-y-3">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="bg-gray-800/70 backdrop-blur p-4 rounded-xl flex justify-between items-center border border-gray-700 hover:border-gray-500 transition"
            >
              <span>{t.title}</span>
              <button
                onClick={() => handleDelete(t.id)}
                className="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* EMPTY */}
        {tasks.length === 0 && (
          <p className="text-center text-gray-500 mt-6">
            No tienes tareas aún 👀
          </p>
        )}

      </div>
    </div>
  );
}

export default App;