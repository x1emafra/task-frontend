import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { getTasks, createTask, deleteTask, updateTask } from "./api";
import Auth from "./Auth";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      toast.error("Error cargando tareas");
    }
  };

  // auto refresh
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      loadTasks(session.user.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [session]);

  const handleAdd = async () => {
    if (!title) return;

    setLoading(true);

    try {
      await createTask({
        title,
        userId: session.user.id,
      });

      setTitle("");
      toast.success("Tarea creada");
    } catch (err) {
      toast.error("Error creando tarea");
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar tarea?")) return;

    try {
      await deleteTask(id);
      toast.success("Tarea eliminada");
    } catch (err) {
      toast.error("Error eliminando");
    }
  };

  const handleToggle = async (task) => {
    try {
      await updateTask(task.id, {
        completed: !task.completed,
      });
    } catch {
      toast.error("Error actualizando");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setTasks(items);

    for (let i = 0; i < items.length; i++) {
      await updateTask(items[i].id, { order: i });
    }
  };

  if (!session) return <Auth />;

  const filteredTasks = tasks
    .filter((t) => {
      if (filter === "completed") return t.completed;
      if (filter === "pending") return !t.completed;
      return true;
    })
    .filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase())
    );

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen flex bg-gray-950 text-white">

      <Toaster position="top-right" />

      {/* SIDEBAR */}
      <div className="w-64 bg-black border-r border-gray-800 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-8">🚀 TaskApp</h1>

          <nav className="space-y-3">
            <button onClick={() => setFilter("all")} className="px-3 py-2 bg-gray-800 rounded w-full text-left">
              📋 Todas
            </button>
            <button onClick={() => setFilter("pending")} className="px-3 py-2 hover:bg-gray-800 rounded w-full text-left">
              ⏳ Pendientes
            </button>
            <button onClick={() => setFilter("completed")} className="px-3 py-2 hover:bg-gray-800 rounded w-full text-left">
              ✅ Completadas
            </button>
          </nav>
        </div>

        <button onClick={() => supabase.auth.signOut()} className="text-red-400">
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-10">

        <h2 className="text-3xl font-bold mb-6">Tus tareas</h2>

        <div className="flex gap-6 mb-6">
          <div className="bg-gray-800 p-4 rounded-xl">{total} total</div>
          <div className="bg-gray-800 p-4 rounded-xl text-green-400">{completed} completadas</div>
        </div>

        <div className="flex gap-2 mb-6 max-w-xl">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nueva tarea..."
            className="flex-1 px-4 py-3 rounded bg-gray-800"
          />
          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-blue-600 px-4 rounded"
          >
            {loading ? "..." : "+"}
          </button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="mb-6 px-4 py-2 rounded bg-gray-800 w-full max-w-xl"
        />

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3 max-w-xl">

                <AnimatePresence>
                  {filteredTasks.map((t, index) => (
                    <Draggable key={t.id} draggableId={String(t.id)} index={index}>
                      {(provided) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          className="bg-gray-800 p-4 rounded flex justify-between items-center"
                        >
                          <div onClick={() => handleToggle(t)} className="flex gap-3 cursor-pointer">
                            <div className={`w-5 h-5 border rounded ${t.completed ? "bg-green-500" : ""}`} />
                            <span className={t.completed ? "line-through text-gray-500" : ""}>
                              {t.title}
                            </span>
                          </div>

                          <button onClick={() => handleDelete(t.id)}>❌</button>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

      </div>
    </div>
  );
}

export default App;