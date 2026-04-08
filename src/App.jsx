import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import ConfirmModal from "./components/ConfirmModal";
import ShareModal from "./components/ShareModal";
import { useTasks } from "./hooks/useTasks";

function App() {
  const {
    session,
    tasks,
    title,
    setTitle,
    loading,
    handleAdd,
    handleDelete,
    handleToggle,
    handleShare,
    handleDragEnd,
  } = useTasks();

  const [confirmModal, setConfirmModal] = useState({ open: false, taskId: null });
  const [shareModal, setShareModal] = useState({ open: false, taskId: null });

  // 🌗 THEME
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") !== "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  if (!session) return <Auth />;

  return (
    <div
      className={`min-h-screen flex justify-center px-4 py-8 sm:p-10 transition-colors ${dark ? "bg-black text-white" : "bg-gray-100 text-gray-900"
        }`}
    >
      <div className="w-full max-w-xl">

        <Toaster position="top-right" />

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Task App
          </h1>

          <div className="flex items-center gap-4">
            {/* TOGGLE */}
            <button
              onClick={() => setDark(!dark)}
              className="text-sm opacity-70 hover:opacity-100 transition"
            >
              {dark ? "☀️" : "🌙"}
            </button>

            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm opacity-70 hover:opacity-100 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* INPUT */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="What needs to be done?"
            className={`flex-1 min-w-0 px-4 py-3 rounded-lg border transition ${dark
                ? "bg-gray-900 border-gray-800 focus:ring-red-500/40"
                : "bg-white border-gray-300"
              }`}
          />
          <button
            onClick={handleAdd}
            disabled={!title.trim()}
            className="px-6 py-3 rounded-lg bg-red-500 hover:bg-red-400 disabled:opacity-30 transition"
          >
            Add
          </button>
        </div>

        {/* LIST */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2"
              >
                <AnimatePresence>
                  {tasks.map((t, index) => (
                    <Draggable
                      key={t.id}
                      draggableId={String(t.id)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          whileHover={{ scale: 1.01 }}
                          className={`p-3 rounded-lg flex justify-between items-center transition ${dark
                              ? "bg-gray-900 hover:bg-gray-800"
                              : "bg-white hover:bg-gray-50 border"
                            }`}
                        >
                          <div
                            onClick={() => handleToggle(t)}
                            className="flex gap-3 items-center cursor-pointer flex-1 min-w-0"
                          >
                            <div
                              className={`w-5 h-5 border rounded ${t.completed
                                  ? "bg-green-500 border-green-500"
                                  : "border-gray-400"
                                }`}
                            />
                            <span
                              className={`truncate ${t.completed
                                  ? "line-through opacity-40"
                                  : ""
                                }`}
                            >
                              {t.title}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShareModal({ open: true, taskId: t.id });
                              }}
                              className="opacity-50 hover:opacity-100"
                            >
                              Share
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmModal({ open: true, taskId: t.id });
                              }}
                              className="opacity-50 hover:opacity-100"
                            >
                              Delete
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

        {/* EMPTY */}
        {!loading && tasks.length === 0 && (
          <div className="text-center py-16 opacity-50">
            No tasks yet
          </div>
        )}

        {/* MODALS */}
        <ConfirmModal
          open={confirmModal.open}
          onConfirm={() => {
            handleDelete(confirmModal.taskId);
            setConfirmModal({ open: false, taskId: null });
          }}
          onCancel={() => setConfirmModal({ open: false, taskId: null })}
        />

        <ShareModal
          open={shareModal.open}
          onShare={(email) => {
            handleShare(shareModal.taskId, email);
            setShareModal({ open: false, taskId: null });
          }}
          onClose={() => setShareModal({ open: false, taskId: null })}
        />

      </div>
    </div>
  );
}

export default App;