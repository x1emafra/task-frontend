import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
  shareTask,
} from "./api";
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

  // LOAD TASKS
  const loadTasks = async (userId) => {
    try {
      const res = await getTasks(userId);
      setTasks(res.data);
    } catch {
      toast.error("Error cargando tareas");
    }
  };

  // CREATE
  const handleAdd = async () => {
    if (!title) return;

    try {
      await createTask({
        title,
        userId: session.user.id,
        email: session.user.email,
      });

      setTitle("");
      loadTasks(session.user.id);
      toast.success("Tarea creada");
    } catch {
      toast.error("Error creando");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar tarea?")) return;

    try {
      await deleteTask(id, session.user.id);
      loadTasks(session.user.id);
      toast.success("Eliminada");
    } catch {
      toast.error("Error eliminando");
    }
  };

  // TOGGLE
  const handleToggle = async (task) => {
    try {
      await updateTask(task.id, {
        completed: !task.completed,
      });
      loadTasks(session.user.id);
    } catch {
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
    } catch {
      toast.error("Usuario no encontrado");
    }
  };

  // 🔥 DRAG & DROP REAL
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

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
    } catch {
      toast.error("Error reordenando");
    }
  };

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl">🚀 Task App</h1>
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
          className="bg-blue-600 px-4 rounded"
        >
          +
        </button>
      </div>

      {/* 🔥 DRAG LIST CORRECTA */}
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
                        {/* LEFT */}
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

                        {/* RIGHT */}
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