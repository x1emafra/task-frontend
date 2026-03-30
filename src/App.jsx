import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
  shareTask,
} from "./api/tasks";
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
  const [loading, setLoading] = useState(false);

  // AUTH
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadTasks(data.session.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) loadTasks(session.user.id);
        else setTasks([]);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // LOAD TASKS ✅ CORREGIDO
  const loadTasks = async (userId) => {
    setLoading(true);
    try {
      const data = await getTasks(userId); // ✅ ya devuelve data
      setTasks(data);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error cargando tareas");
    } finally {
      setLoading(false);
    }
  };

  // CREATE (optimistic)
  const handleAdd = async () => {
    if (!title.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const tempTask = {
      id: tempId,
      title,
      completed: false,
    };

    setTasks((prev) => [tempTask, ...prev]);
    setTitle("");

    try {
      const created = await createTask({
        title,
        userId: session.user.id,
        email: session.user.email,
      });

      // Reemplazo el task temporal (optimistic) con el task real del backend
      setTasks((prev) =>
        prev.map((t) => (t.id === tempId ? created : t))
      );

      toast.success("Tarea creada");
    } catch (error) {
      console.log(error);
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      toast.error(error?.response?.data?.message || "Error creando");
    }
  };

  // DELETE (optimistic)
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar tarea?")) return;

    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTask(id, session.user.id);
      toast.success("Eliminada");
    } catch (error) {
      console.log(error);
      setTasks(previous);
      toast.error("Error eliminando");
    }
  };

  // TOGGLE (optimistic) ✅ CORREGIDO closure
  const handleToggle = async (task) => {
    const previous = tasks;

    const updated = tasks.map((t) =>
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );

    setTasks(updated);

    try {
      await updateTask(task.id, {
        completed: !task.completed,
      });
    } catch (error) {
      console.log(error);
      setTasks(previous); // rollback correcto
      toast.error("Error actualizando");
    }
  };

  // SHARE
  const handleShare = async (taskId) => {
    const email = prompt("Email para compartir:");
    if (!email) return;

    try {
      await shareTask({ taskId, email });
      toast.success("Compartido");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Usuario no encontrado");
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
      console.log(error);
      setTasks(previousTasks); // rollback crash-safe
      toast.error("Error reordenando");
    }
  };

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl text-red-500">
  🚀 Task App
</h1>
        <button onClick={() => supabase.auth.signOut()}>
          Logout
        </button>
      </div>

      {/* INPUT */}
      <div className="flex gap-2 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nueva tarea..."
          className="bg-gray-800 px-4 py-2 rounded w-64"
        />
        <button
          onClick={handleAdd}
          disabled={!title.trim()}
          className={`px-4 rounded ${
            title.trim()
              ? "bg-blue-600"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          +
        </button>
      </div>

      {/* LOADING */}
      {loading && <p className="text-gray-400">Cargando...</p>}

      {/* LISTA */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-3 max-w-xl"
            >
              <AnimatePresence>
                {tasks.map((t, index) => (
                  <Draggable
                    key={t.id}
                    draggableId={String(t.id)}
                    index={index}
                  >
                    {(provided) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-800 p-4 rounded flex justify-between items-center"
                      >
                        <div
                          onClick={() => handleToggle(t)}
                          className="flex gap-3 cursor-pointer"
                        >
                          <div
                            className={`w-5 h-5 border rounded ${
                              t.completed ? "bg-green-500" : ""
                            }`}
                          />
                          <span
                            className={
                              t.completed
                                ? "line-through text-gray-500"
                                : ""
                            }
                          >
                            {t.title}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => handleShare(t.id)}>
                            📤
                          </button>
                          <button onClick={() => handleDelete(t.id)}>
                            ❌
                          </button>
                        </div>
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
  );
}

export default App;