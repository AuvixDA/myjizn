import { motion } from 'framer-motion';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  'aria-label'?: string;
}

export function Checkbox({ checked, onChange, disabled = false, ...rest }: CheckboxProps) {
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      whileTap={disabled ? undefined : { scale: 0.85 }}
      className={`relative flex items-center justify-center size-5 shrink-0 rounded-[7px] border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
        checked
          ? 'bg-gradient-to-b from-accent-soft to-accent-dim border-transparent'
          : 'border-white/[0.18] bg-white/[0.03] hover:border-white/35'
      } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
      {...rest}
    >
      <motion.svg viewBox="0 0 16 16" className="size-3 text-white" initial={false}>
        <motion.path
          d="M3 8.3 6.2 11.5 13 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.svg>
    </motion.button>
  );
}
