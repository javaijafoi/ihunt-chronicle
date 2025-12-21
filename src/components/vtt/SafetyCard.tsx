import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, AlertTriangle } from 'lucide-react';

interface SafetyCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SafetyCard({ isOpen, onClose }: SafetyCardProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Full screen red overlay */}
          <motion.div
            className="absolute inset-0 bg-destructive/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Content */}
          <motion.div
            className="relative z-10 text-center p-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <motion.div
              className="w-32 h-32 mx-auto mb-6 rounded-full bg-destructive-foreground/10 
                       flex items-center justify-center border-4 border-destructive-foreground"
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 0 0 hsl(var(--destructive-foreground) / 0.5)',
                  '0 0 0 20px hsl(var(--destructive-foreground) / 0)',
                  '0 0 0 0 hsl(var(--destructive-foreground) / 0)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <X className="w-16 h-16 text-destructive-foreground" strokeWidth={3} />
            </motion.div>
            
            <h1 className="font-display text-5xl text-destructive-foreground mb-4">
              CARTÃO X
            </h1>
            
            <p className="text-xl text-destructive-foreground/80 font-ui max-w-md mx-auto mb-8">
              A mesa está pausada. Respire. O GM irá retomar quando todos estiverem prontos.
            </p>

            <div className="flex items-center justify-center gap-2 text-destructive-foreground/60 text-sm">
              <Shield className="w-4 h-4" />
              <span className="font-ui">Apenas o GM pode retomar a sessão</span>
            </div>
            
            <motion.button
              onClick={onClose}
              className="mt-8 px-6 py-3 rounded-lg border-2 border-destructive-foreground 
                       text-destructive-foreground font-display text-lg
                       hover:bg-destructive-foreground/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retomar Sessão (GM)
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
