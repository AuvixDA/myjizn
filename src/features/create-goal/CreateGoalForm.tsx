import { useState, type FormEvent } from 'react';
import { createGoal } from '../../entities/goal/api/goalApi';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';

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
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Новая цель…" className="flex-1" />
      <Button type="submit" disabled={submitting || !title.trim()}>
        Создать
      </Button>
    </form>
  );
}
