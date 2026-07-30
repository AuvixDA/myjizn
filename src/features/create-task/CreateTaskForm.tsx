import { useState, type FormEvent } from 'react';
import { createTask } from '../../entities/task/api/taskApi';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';

interface CreateTaskFormProps {
  onCreated?: () => void;
}

export function CreateTaskForm({ onCreated }: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await createTask({ title: title.trim() });
      setTitle('');
      onCreated?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Новая задача…" className="flex-1" />
      <Button type="submit" disabled={submitting || !title.trim()}>
        Добавить
      </Button>
    </form>
  );
}
