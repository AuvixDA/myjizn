import type { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  className?: string;
  interactive?: boolean;
  /** Stagger delay in seconds, e.g. index * 0.04 for list entrance animations. */
  delay?: number;
}

export function GlassCard({ children, className = '', interactive = false, delay = 0 }: PropsWithChildren<GlassCardProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={interactive ? { y: -2, borderColor: 'rgb(124 108 255 / 0.35)' } : undefined}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay }}
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-glass shadow-glass p-4 ${className}`}
    >
      {children}
    </motion.div>
  );
}
