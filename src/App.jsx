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
      console.error("ERROR CARGANDO TASKS:", error);
    }
  };

  const handleAdd = async () => {
    if (!title) return;

    try {
      await createTask({
        title,
        userId: session.user.id, // 👈 CLAVE
      });

      setTitle("");
      loadTasks(session.user.id);
    } catch (error) {
      console.error("ERROR CREANDO:", error);
    }
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    loadTasks(session.user.id);
  };

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-20">
      <h1 className="text-3xl mb-6">🚀 Task App</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nueva tarea..."
          className="px-4 py-2 rounded bg-gray-800"
        />
        <button onClick={handleAdd} className="bg-blue-600 px-4 rounded">
          +
        </button>
      </div>

      <ul className="w-80">
        {tasks.map((t) => (
          <li
            key={t.id}
            className="bg-gray-800 p-3 mb-2 rounded flex justify-between"
          >
            {t.title}
            <button onClick={() => handleDelete(t.id)}>❌</button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => supabase.auth.signOut()}
        className="mt-6 text-red-400"
      >
        Logout
      </button>
    </div>
  );
}

export default App;