import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2 } from "lucide-react";

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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gray-950 border border-white/10 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-500/10 text-blue-500 rounded-3xl border border-blue-500/20">
                <Share2 size={32} />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Compartir tarea
              </h2>
              <p className="text-gray-400 text-sm">
                Colabora con otros usuarios ingresando su dirección de correo electrónico.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email del colaborador</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-gray-600 shadow-inner"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3.5 rounded-2xl bg-white/5 text-white hover:bg-white/10 transition-all font-bold text-sm order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!email.trim()}
                  className="flex-1 px-6 py-3.5 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold text-sm shadow-xl shadow-blue-500/30 order-1 sm:order-2 disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none"
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
