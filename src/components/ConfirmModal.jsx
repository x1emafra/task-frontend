import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

export default function ConfirmModal({ open, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="bg-gray-950 border border-white/10 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
                <Trash2 size={32} />
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-white mb-2">
                ¿Eliminar tarea?
              </h2>
              <p className="text-gray-400 text-sm">
                Esta acción es permanente y no se podrá recuperar la información.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3.5 rounded-2xl bg-white/5 text-white hover:bg-white/10 transition-all font-bold text-sm order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-6 py-3.5 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all font-bold text-sm shadow-lg shadow-red-500/20 order-1 sm:order-2"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
