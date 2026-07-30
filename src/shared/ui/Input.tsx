import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

const FIELD_CLASSES =
  'rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-sm outline-none placeholder:text-white/30 transition-shadow focus:border-accent/60 focus:shadow-glow-accent';

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${FIELD_CLASSES} ${className}`} {...rest} />;
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${FIELD_CLASSES} resize-none ${className}`} {...rest} />;
}
