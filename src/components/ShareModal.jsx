import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ShareModal({ open, onShare, onClose }) {
  const [email, setEmail] = useState("");

  // Limpia el input al abrir
  useEffect(() => {
    if (open) setEmail("");
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    onShare(email.trim());
    setEmail("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-80 shadow-2xl"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-3xl mb-3">📤</div>
            <h2 className="text-lg font-semibold text-white mb-1">
              Compartir tarea
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Ingresa el email del usuario con quien quieres compartir.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@email.com"
                autoFocus
                className="bg-gray-800 px-4 py-2 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!email.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors text-sm font-medium disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  Compartir
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
