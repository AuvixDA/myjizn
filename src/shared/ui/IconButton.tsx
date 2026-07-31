import type { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd'
>;

interface IconButtonProps extends NativeButtonProps {
  variant?: 'default' | 'danger';
  label: string;
}

const VARIANT_CLASSES: Record<NonNullable<IconButtonProps['variant']>, string> = {
  default: 'text-white/40 hover:text-white hover:bg-white/[0.08]',
  danger: 'text-white/40 hover:text-rose-400 hover:bg-rose-400/10',
};

export function IconButton({ variant = 'default', label, className = '', ...rest }: IconButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.9 }}
      className={`flex items-center justify-center size-7 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-soft ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    />
  );
}
