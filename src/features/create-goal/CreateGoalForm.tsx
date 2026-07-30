import { useState, type FormEvent } from 'react';
import { createGoal } from '../../entities/goal/api/goalApi';
import { Button } from '../../shared/ui/Button';

interface CreateGoalFormProps {
  onCreated?: () => void;
}

export function CreateGoalForm({ onCreated }: CreateGoalFormProps) {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await createGoal({ title: title.trim() });
      setTitle('');
      onCreated?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Новая цель…"
        className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <Button type="submit" disabled={submitting || !title.trim()}>
        Создать
      </Button>
    </form>
  );
}
