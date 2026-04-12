import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
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
import { useAuth } from "./hooks/useAuth";
import { useLogger } from "./hooks/useLogger";
import { useTranslation } from "react-i18next";
import i18n from "./i18n";

function App() {
  const logger = useLogger();
  const { debugLogs, lastError, clearLogs } = logger;
  const { session, loading: authLoading, handleLogout, handleReset } = useAuth(logger.addLog);

  // 🕒 LIVE CLOCK & CALENDAR STATE
  const [time, setTime] = useState(new Date());
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const {
    tasks,
    title,
    setTitle,
    loading: tasksLoading,
    handleAdd,
    handleDelete,
    handleToggle,
    handleShare,
    handleDragEnd,
    retryLoad,
  } = useTasks(session, logger);

  const loading = authLoading || tasksLoading;

  const { t } = useTranslation();

  const [confirmModal, setConfirmModal] = useState({ open: false, taskId: null });
  const [shareModal, setShareModal] = useState({ open: false, taskId: null });
  const [showDebug, setShowDebug] = useState(false);

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
      // 📅 Filtrado por fecha del calendario
      const taskDateStr = t.date ? new Date(t.date).toISOString().split('T')[0] : "";
      const selectedDateStr = new Date(date).toISOString().split('T')[0];
      return taskDateStr === selectedDateStr;
    })
    .filter((t) => {
      if (filter === "completed") return t.completed;
      if (filter === "pending") return !t.completed;
      return true;
    })
    .filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase())
    );

  const username =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.display_name ||
    session?.user?.email?.split("@")[0] ||
    "Usuario";

  if (!session) return <Auth />;

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden ${dark
      ? "bg-gradient-to-br from-black via-gray-900 to-black text-white"
      : "bg-gradient-to-br from-gray-100 via-white to-gray-200 text-gray-900"
      } flex items-center justify-center p-4`}>

      <Toaster position="top-right" />

      <div className={`w-full max-w-5xl backdrop-blur-xl rounded-3xl p-6 shadow-2xl border transition-all duration-300 ${dark
        ? "bg-white/5 border-white/10"
        : "bg-white/70 border-gray-200"
        }`}>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("title") || "Hola"}, {username} 👋
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm font-medium ${dark ? "text-blue-400" : "text-blue-600"}`}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-gray-400 text-xs">•</span>
              <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">
                {time.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 bg-black/10 dark:bg-white/5 p-1 rounded-xl">
              {/* 🌍 LANGUAGE */}
              <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className={`text-xs bg-transparent border-none cursor-pointer outline-none font-bold px-2 ${dark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"}`}
                defaultValue={i18n.language}
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="sv">SV</option>
              </select>

              {/* 🌗 THEME */}
              <button
                onClick={() => setDark(!dark)}
                className={`p-2 rounded-lg transition-all ${dark ? "bg-gray-800 text-yellow-400 hover:bg-gray-700" : "bg-white text-indigo-600 hover:bg-gray-100 shadow-sm"}`}
              >
                {dark ? "☀️" : "🌙"}
              </button>
            </div>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${dark
                ? "bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                }`}
            >
              {t("logout")}
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* IZQUIERDA: TASK MANAGER (8 columns) */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* 📊 DASHBOARD & SEARCH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex-1 text-center border-r border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total</p>
                  <p className="text-xl font-bold">{tasks.length}</p>
                </div>
                <div className="flex-1 text-center border-r border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-green-400 font-bold mb-1">Done</p>
                  <p className="text-xl font-bold text-green-400">{tasks.filter(t => t.completed).length}</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-orange-400 font-bold mb-1">Left</p>
                  <p className="text-xl font-bold text-orange-400">{tasks.filter(t => !t.completed).length}</p>
                </div>
              </div>

              <div className="relative flex items-center">
                <input
                  placeholder={t("search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full h-full px-4 py-3 rounded-2xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/50 ${dark
                    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                    : "bg-white border-gray-200 text-black placeholder-gray-400 focus:border-blue-400"
                    }`}
                />
                <span className="absolute right-4 opacity-30">🔍</span>
              </div>
            </div>

            {/* 🧠 FILTERS & INPUT */}
            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl w-fit">
                {["all", "pending", "completed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f
                      ? "bg-blue-600 text-white shadow-lg"
                      : dark
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    {t(f)?.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd(date)}
                  placeholder={t("placeholder")}
                  className={`flex-1 px-5 py-3.5 rounded-2xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/50 ${dark
                    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                    : "bg-white border-gray-200 text-black placeholder-gray-400 focus:border-blue-400 shadow-inner"
                    }`}
                />
                <button
                  onClick={() => handleAdd(date)}
                  className="px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all transform active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  +
                </button>
              </div>
            </div>

            {/* LIST */}
            <div className={`flex-1 min-h-[400px] max-h-[500px] overflow-y-auto pr-2 custom-scrollbar`}>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="tasks">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {filteredTasks.map((t, index) => (
                          <Draggable key={t.id} draggableId={String(t.id)} index={index}>
                            {(provided) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className={`p-4 rounded-2xl border transition-all duration-200 flex justify-between items-center group ${dark
                                  ? "bg-white/5 border-white/5 hover:border-blue-500/30 hover:bg-white/10"
                                  : "bg-white border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md"
                                  }`}
                              >
                                <div
                                  className="flex items-center gap-4 cursor-pointer flex-1"
                                  onClick={() => handleToggle(t)}
                                >
                                  <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${t.completed
                                    ? "bg-green-500 border-green-500 shadow-lg shadow-green-500/40"
                                    : dark ? "border-gray-700 group-hover:border-blue-500" : "border-gray-300 group-hover:border-blue-500"
                                    }`}>
                                    {t.completed && <span className="text-white text-xs">✔</span>}
                                  </div>
                                  <span className={`font-medium transition-all ${t.completed ? "line-through opacity-40" : ""}`}>
                                    {t.title}
                                  </span>
                                </div>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setShareModal({ open: true, taskId: t.id }); }}
                                    className={`p-2 rounded-xl transition-colors ${dark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                                  >
                                    🔗
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmModal({ open: true, taskId: t.id }); }}
                                    className={`p-2 rounded-xl transition-colors ${dark ? "hover:bg-red-900/40 text-red-400" : "hover:bg-red-50 text-red-500"}`}
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
                <div className="text-center py-20 opacity-30 flex flex-col items-center gap-2">
                  <span className="text-4xl">📝</span>
                  <p className="font-medium">{t("empty")}</p>
                </div>
              )}
            </div>
          </div>

          {/* DERECHA: CALENDAR & EXTRAS (4 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`p-4 rounded-3xl border transition-all ${dark
              ? "bg-white/5 border-white/5"
              : "bg-white border-gray-100 shadow-xl"
              }`}>
              <Calendar
                onChange={setDate}
                value={date}
                className={`w-full rounded-2xl border-none font-sans ${dark ? 'dark-calendar' : ''}`}
                locale={i18n.language}
              />
            </div>

            {/* QUICK ACTIONS OR INFO */}
            <div className={`p-6 rounded-3xl border ${dark ? "bg-blue-500/5 border-blue-500/10" : "bg-blue-50 border-blue-100"}`}>
              <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${dark ? "text-blue-400" : "text-blue-600"}`}>
                Tip del día
              </h3>
              <p className={`text-sm leading-relaxed ${dark ? "text-gray-300" : "text-gray-700"}`}>
                Organiza tus tareas por prioridad para maximizar tu productividad hoy.
              </p>
            </div>
          </div>

        </div>

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

        {/* 🐛 DEBUG PANEL (Miniaturized) */}
        {!loading && (
          <div className="mt-10 border-t border-white/5 pt-6 opacity-20 hover:opacity-100 transition-opacity pb-10">
            <div className="flex justify-between items-center mb-2 px-2">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold"
              >
                {showDebug ? "[-]" : "[+]"} Debug System
              </button>
              {showDebug && (
                <div className="flex gap-2">
                  <button onClick={retryLoad} className="hover:text-blue-400 text-[10px] font-bold">RETRY</button>
                  <button onClick={clearLogs} className="hover:text-orange-400 text-[10px] font-bold">CLEAR</button>
                  <button onClick={handleReset} className="hover:text-red-400 text-[10px] font-bold">RESET</button>
                </div>
              )}
            </div>

            {showDebug && (
              <div className="bg-black/80 backdrop-blur-md p-6 rounded-2xl font-mono text-[10px] overflow-auto max-h-80 border border-white/10 shadow-2xl">
                <p className="text-blue-400 mb-2 font-bold underline">SYSTEM INFO</p>
                <p>User ID: {session?.user?.id || "None"}</p>
                <p>Metadata: {JSON.stringify(session?.user?.user_metadata || {})}</p>
                <p>Tasks: {tasks.length}</p>

                {lastError && (
                  <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-xl">
                    <p className="text-red-400 font-bold mb-1 uppercase tracking-tighter">LAST ERROR ({lastError.op})</p>
                    <pre className="whitespace-pre-wrap text-red-300 opacity-80">
                      {JSON.stringify(lastError.error, null, 2)}
                    </pre>
                  </div>
                )}

                <p className="text-blue-400 mt-6 mb-2 font-bold underline">EVENT LOG</p>
                <div className="flex flex-col gap-1">
                  {debugLogs.map((log, i) => (
                    <div key={i} className="border-l border-white/10 pl-3 py-1 text-gray-500">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(155, 155, 155, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(155, 155, 155, 0.4); }
        
        /* React Calendar Customization */
        .react-calendar { background: transparent; color: inherit; border: none; width: 100%; font-family: inherit; }
        .react-calendar__navigation button { color: inherit; min-width: 44px; background: none; font-size: 16px; margin-top: 8px; font-weight: bold; }
        .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus { background-color: rgba(255,255,255,0.1); border-radius: 12px; }
        .react-calendar__month-view__weekdays { font-size: 0.7em; font-weight: bold; text-transform: uppercase; color: #666; }
        .react-calendar__tile { border-radius: 12px; padding: 12px; transition: all 0.2s; color: inherit; }
        .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background-color: rgba(59, 130, 246, 0.1) !important; color: #3b82f6 !important; }
        .react-calendar__tile--now { background: rgba(59, 130, 246, 0.1) !important; color: #3b82f6 !important; font-weight: bold; }
        .react-calendar__tile--active { background: #3b82f6 !important; color: white !important; shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5); }
        
        .dark-calendar .react-calendar__month-view__days__day--neighboringMonth { color: #444 !important; }
        .dark-calendar .react-calendar__month-view__weekdays__weekday { color: #888; }
        .react-calendar__month-view__days__day--neighboringMonth { color: #ccc; }
      `}</style>
    </div>
  );
}

export default App;
