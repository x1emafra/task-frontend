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
import ConfirmModal from "./components/ConfirmModal";
import ShareModal from "./components/ShareModal";

function App() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal states
  const [confirmModal, setConfirmModal] = useState({ open: false, taskId: null });
  const [shareModal, setShareModal] = useState({ open: false, taskId: null });

  // AUTH — Fix race condition: solo onAuthStateChange, diferenciado por evento
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);

        if (_event === "INITIAL_SESSION" || _event === "SIGNED_IN") {
          if (session?.user?.id) loadTasks();
        } else if (_event === "SIGNED_OUT") {
          setTasks([]);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // LOAD TASKS
  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error(error);
      toast.error("Error cargando tareas");
    } finally {
      setLoading(false);
    }
  };

  // CREATE — Optimistic UI
  const handleAdd = async () => {
    if (!title.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const tempTask = { id: tempId, title, completed: false };

    setTasks((prev) => [tempTask, ...prev]);
    setTitle("");

    try {
      const created = await createTask({ title });

      // ✅ Reemplaza tempTask por el real
      setTasks((prev) =>
        prev.map((t) => (t.id === tempId ? created : t))
      );

      toast.success("Tarea creada");
    } catch (error) {
      console.error(error);

      // ❌ Rollback si falla
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      toast.error("Error creando");
    }
  };

  // DELETE — usa modal en vez de confirm()
  const handleDelete = async () => {
    const id = confirmModal.taskId;
    const previous = tasks;

    setTasks((prev) => prev.filter((t) => t.id !== id));
    setConfirmModal({ open: false, taskId: null });

    try {
      await deleteTask(id);
      toast.success("Eliminada");
    } catch (error) {
      console.error(error);
      setTasks(previous);
      toast.error("Error eliminando");
    }
  };

  // TOGGLE — Optimistic UI
  const handleToggle = async (task) => {
    const previous = tasks;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      )
    );

    try {
      await updateTask(task.id, { completed: !task.completed });
    } catch (error) {
      console.error(error);
      setTasks(previous);
      toast.error("Error actualizando");
    }
  };

  // SHARE — usa modal en vez de prompt()
  const handleShare = async (email) => {
    const { taskId } = shareModal;
    setShareModal({ open: false, taskId: null });

    try {
      await shareTask({ taskId, email });
      toast.success("Compartido");
    } catch (error) {
      console.error(error);
      toast.error("Usuario no encontrado");
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
      console.error(error);
      setTasks(previousTasks);
      toast.error("Error reordenando");
    }
  };

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <Toaster position="top-right" />

      {/* MODALES */}
      <ConfirmModal
        open={confirmModal.open}
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ open: false, taskId: null })}
      />
      <ShareModal
        open={shareModal.open}
        onShare={handleShare}
        onClose={() => setShareModal({ open: false, taskId: null })}
      />

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
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
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
                          <button
                            onClick={() =>
                              setShareModal({ open: true, taskId: t.id })
                            }
                          >
                            📤
                          </button>
                          <button
                            onClick={() =>
                              setConfirmModal({ open: true, taskId: t.id })
                            }
                          >
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