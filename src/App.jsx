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
import { useTranslation } from "react-i18next";
import i18n from "./i18n";

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

  const { t } = useTranslation();

  const [confirmModal, setConfirmModal] = useState({ open: false, taskId: null });
  const [shareModal, setShareModal] = useState({ open: false, taskId: null });

  // 🌗 THEME
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") !== "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // 🔎 SEARCH + FILTER
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredTasks = tasks
    .filter((t) => {
      if (filter === "completed") return t.completed;
      if (filter === "pending") return !t.completed;
      return true;
    })
    .filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase())
    );

  if (!session) return <Auth />;

  return (
    <div
      className={`min-h-screen flex justify-center px-4 py-8 sm:p-10 transition-colors ${dark ? "bg-black text-white" : "bg-gray-100 text-gray-900"
        }`}
    >
      <div className="w-full max-w-xl">

        <Toaster position="top-right" />

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold">
            {t("title")}
          </h1>

          <div className="flex items-center gap-3">

            {/* 🌍 LANGUAGE */}
            <select
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="text-sm bg-transparent"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="sv">SV</option>
            </select>

            {/* 🌗 THEME */}
            <button onClick={() => setDark(!dark)}>
              {dark ? "☀️" : "🌙"}
            </button>

            {/* LOGOUT */}
            <button onClick={() => supabase.auth.signOut()}>
              {t("logout")}
            </button>
          </div>
        </div>

        {/* 📊 DASHBOARD */}
        <div className="flex gap-4 mb-4 text-sm opacity-70">
          <span>Total: {tasks.length}</span>
          <span>✔ {tasks.filter(t => t.completed).length}</span>
          <span>⏳ {tasks.filter(t => !t.completed).length}</span>
        </div>

        {/* 🔎 SEARCH */}
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg border"
        />

        {/* 🧠 FILTERS */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setFilter("all")}>{t("all")}</button>
          <button onClick={() => setFilter("pending")}>{t("pending")}</button>
          <button onClick={() => setFilter("completed")}>{t("completed")}</button>
        </div>

        {/* INPUT */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={t("placeholder")}
            className={`flex-1 px-4 py-3 rounded-lg border ${dark ? 'bg-gray-900 text-white' : 'bg-white text-black'
              }`}
          />
          <button onClick={handleAdd}>
            {t("add")}
          </button>
        </div>

        {/* LIST */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <AnimatePresence>
                  {filteredTasks.map((t, index) => (
                    <Draggable key={t.id} draggableId={String(t.id)} index={index}>
                      {(provided) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="p-3 mb-2 rounded-lg border flex justify-between"
                        >
                          <span onClick={() => handleToggle(t)}>
                            {t.title}
                          </span>

                          <div className="flex gap-2">
                            <button onClick={() => setShareModal({ open: true, taskId: t.id })}>
                              Share
                            </button>
                            <button onClick={() => setConfirmModal({ open: true, taskId: t.id })}>
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
        {!loading && filteredTasks.length === 0 && (
          <div className="text-center py-10 opacity-50">
            {t("empty")}
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