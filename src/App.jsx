import { useState } from "react";
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

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 sm:p-10 font-sans tracking-tight flex justify-center overflow-x-hidden">

      <div className="w-full max-w-xl">

        <Toaster position="top-right" />

        {/* MODALES */}
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

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
            🚀 Task App
          </h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>

        {/* INPUT */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="¿Qué tienes pendiente?"
            className="bg-gray-900 border border-gray-800 px-4 py-3 rounded-xl flex-1 min-w-0 text-white outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder:text-gray-600 shadow-lg"
          />
          <button
            onClick={handleAdd}
            disabled={!title.trim()}
            className="bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 w-full sm:w-auto"
          >
            Añadir
          </button>
        </div>

        {/* LOADING */}
        {loading && tasks.length === 0 && (
          <div className="text-center py-10">
            <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Cargando tus tareas...</p>
          </div>
        )}

        {/* LISTA */}
        <div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3 sm:space-y-4"
                >
                  <AnimatePresence mode="popLayout">
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
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: snapshot.isDragging ? 1.05 : 1,
                              zIndex: snapshot.isDragging ? 50 : 1,
                            }}
                            exit={{ opacity: 0, x: -20 }}
                            className={`group bg-gray-900/50 hover:bg-gray-900 border border-gray-800/50 hover:border-gray-700 p-3 sm:p-4 rounded-xl flex justify-between items-center transition-all shadow-sm ${snapshot.isDragging ? "shadow-2xl ring-2 ring-red-500/20" : ""
                              }`}
                          >
                            <div
                              onClick={() => handleToggle(t)}
                              className="flex gap-3 sm:gap-4 cursor-pointer items-center flex-1 min-w-0"
                            >
                              <div
                                className={`w-5 h-5 sm:w-6 sm:h-6 border-2 rounded-lg flex items-center justify-center transition-all ${t.completed
                                    ? "bg-green-500 border-green-500"
                                    : "border-gray-700 group-hover:border-gray-500"
                                  }`}
                              >
                                {t.completed && (
                                  <svg
                                    className="w-3 h-3 sm:w-4 sm:h-4 text-black"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span
                                className={`text-sm sm:text-lg font-medium truncate ${t.completed
                                    ? "line-through text-gray-500"
                                    : "text-gray-200"
                                  }`}
                              >
                                {t.title}
                              </span>
                            </div>

                            <div className="flex gap-1 sm:gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShareModal({ open: true, taskId: t.id });
                                }}
                                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                              >
                                📤
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmModal({ open: true, taskId: t.id });
                                }}
                                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                              >
                                🗑️
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

        {/* FOOTER */}
        {!loading && tasks.length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <p className="text-gray-600 italic text-sm sm:text-base">
              No tienes tareas pendientes. ¡Disfruta de tu tiempo libre! 🏖️
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;