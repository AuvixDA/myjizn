import type { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'ghost';

// framer-motion's own event handler types (onAnimationStart, onDrag, ...)
// conflict with React's DOM event handler types of the same name, so the
// clashing native handlers are dropped in favor of motion's.
type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd'
>;

interface ButtonProps extends NativeButtonProps {
  variant?: ButtonVariant;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-b from-accent-soft to-accent-dim text-white shadow-glow-accent',
  ghost: 'bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]',
};

export function Button({ variant = 'primary', className = '', disabled, ...rest }: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      disabled={disabled}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-40 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    />
  );
}
