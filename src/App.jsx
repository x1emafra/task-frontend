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
    <div className="min-h-screen flex bg-gray-950 text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-black border-r border-gray-800 p-6 flex flex-col justify-between">

        <div>
          <h1 className="text-2xl font-bold mb-8">🚀 TaskApp</h1>

          <nav className="space-y-4">
            <p className="text-gray-400 text-sm">MENU</p>

            <button className="block w-full text-left px-3 py-2 rounded-lg bg-gray-800">
              📋 Tareas
            </button>

            <button className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800">
              📊 Stats (próximo)
            </button>

            <button className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800">
              ⚙️ Settings (próximo)
            </button>
          </nav>
        </div>

        <button
          onClick={() => supabase.auth.signOut()}
          className="text-red-400 hover:text-red-300"
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-10">

        <h2 className="text-3xl font-bold mb-6">Tus tareas</h2>

        {/* INPUT */}
        <div className="flex gap-2 mb-8 max-w-xl">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nueva tarea..."
            className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl"
          >
            Agregar
          </button>
        </div>

        {/* LISTA */}
        <div className="grid gap-4 max-w-xl">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="bg-gray-800 p-4 rounded-xl flex justify-between items-center border border-gray-700 hover:border-gray-500 transition"
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
          <p className="text-gray-500 mt-6">
            No tienes tareas aún 👀
          </p>
        )}

      </div>
    </div>
  );
}

export default App;