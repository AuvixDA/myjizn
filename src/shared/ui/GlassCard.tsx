import type { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  className?: string;
}

export function GlassCard({ children, className = '' }: PropsWithChildren<GlassCardProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`rounded-2xl border border-white/10 bg-surface-raised/60 backdrop-blur-glass shadow-lg shadow-black/20 p-4 ${className}`}
    >
      {children}
    </motion.div>
  );
}
