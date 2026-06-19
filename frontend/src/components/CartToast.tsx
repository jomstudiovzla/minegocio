"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X } from 'lucide-react';
import { useEffect } from 'react';

interface CartToastProps {
  message: string;
  image?: string;
  visible: boolean;
  onDismiss: () => void;
}

export default function CartToast({ message, image, visible, onDismiss }: CartToastProps) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onDismiss, 2800);
      return () => clearTimeout(t);
    }
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-white border border-mi-blue/20 shadow-2xl shadow-mi-blue/10 rounded-2xl px-4 py-3 min-w-[260px] max-w-xs"
        >
          {image && (
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
              <img src={image} alt="" className="max-h-full object-contain mix-blend-multiply" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-mi-blue uppercase tracking-wide">¡Añadido al carrito!</p>
            <p className="text-sm font-bold text-gray-800 truncate">{message}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-mi-blue rounded-xl flex items-center justify-center shrink-0">
              <ShoppingCart size={16} className="text-white" />
            </div>
            <button onClick={onDismiss} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition">
              <X size={14} />
            </button>
          </div>
          {/* Progress bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 2.8, ease: 'linear' }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-mi-blue/30 rounded-b-2xl origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
