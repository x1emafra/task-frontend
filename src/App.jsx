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
              className={`text-sm bg-transparent border-none cursor-pointer outline-none ${dark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"}`}
              defaultValue={i18n.language}
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="sv">SV</option>
            </select>

            {/* 🌗 THEME */}
            <button
              onClick={() => setDark(!dark)}
              className={`p-2 rounded-full transition-all ${dark ? "bg-gray-800 text-yellow-400 hover:bg-gray-700" : "bg-gray-200 text-indigo-600 hover:bg-gray-300"}`}
            >
              {dark ? "☀️" : "🌙"}
            </button>

            {/* LOGOUT */}
            <button
              onClick={() => supabase.auth.signOut()}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${dark ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-black shadow-sm"}`}
            >
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
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full mb-4 px-4 py-2 rounded-lg border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/50 ${dark
              ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
              : "bg-white border-gray-200 text-black placeholder-gray-400 focus:border-blue-400"
            }`}
        />

        {/* 🧠 FILTERS */}
        <div className="flex gap-2 mb-6">
          {["all", "pending", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-sm transition-all ${filter === f
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : dark
                    ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-900"
                }`}
            >
              {t(f)}
            </button>
          ))}
        </div>

        {/* INPUT */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={t("placeholder")}
            className={`flex-1 px-4 py-3 rounded-lg border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/50 ${dark
                ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                : "bg-white border-gray-200 text-black placeholder-gray-400 focus:border-blue-400"
              }`}
          />
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all transform active:scale-95 shadow-lg shadow-blue-500/20"
          >
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
                          className={`p-4 mb-3 rounded-xl border transition-all duration-200 flex justify-between items-center group ${dark
                              ? "bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-800"
                              : "bg-white border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md"
                            }`}
                        >
                          <div
                            className="flex items-center gap-3 cursor-pointer flex-1"
                            onClick={() => handleToggle(t)}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${t.completed
                                ? "bg-green-500 border-green-500"
                                : "border-gray-400 group-hover:border-blue-500"
                              }`}>
                              {t.completed && <span className="text-white text-xs">✔</span>}
                            </div>
                            <span className={`transition-all ${t.completed ? "line-through opacity-50" : ""}`}>
                              {t.title}
                            </span>
                          </div>

                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setShareModal({ open: true, taskId: t.id })}
                              className={`p-2 rounded-lg transition-colors ${dark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                              title="Share"
                            >
                              🔗
                            </button>
                            <button
                              onClick={() => setConfirmModal({ open: true, taskId: t.id })}
                              className={`p-2 rounded-lg transition-colors ${dark ? "hover:bg-red-900/30 text-red-400" : "hover:bg-red-50 text-red-500"}`}
                              title="Delete"
                            >
                              🗑
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