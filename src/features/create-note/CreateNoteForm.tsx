import { useState, type FormEvent } from 'react';
import { createNote } from '../../entities/note/api/noteApi';
import { Button } from '../../shared/ui/Button';

interface CreateNoteFormProps {
  onCreated?: () => void;
}

export function CreateNoteForm({ onCreated }: CreateNoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await createNote({ title: title.trim(), content: content.trim() });
      setTitle('');
      setContent('');
      onCreated?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Заголовок…"
        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Текст заметки…"
        rows={3}
        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-accent resize-none"
      />
      <Button type="submit" disabled={submitting || !title.trim()} className="self-start">
        Сохранить
      </Button>
    </form>
  );
}
