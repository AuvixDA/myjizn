import { useState, type FormEvent } from 'react';
import { createProject } from '../../entities/project/api/projectApi';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';

export function CreateProjectForm() {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await createProject({ title: title.trim() });
      setTitle('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Новый проект…" className="flex-1" />
      <Button type="submit" disabled={submitting || !title.trim()}>
        Создать
      </Button>
    </form>
  );
}
