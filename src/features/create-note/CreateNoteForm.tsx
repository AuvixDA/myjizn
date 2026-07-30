import { useState, type FormEvent } from 'react';
import { createNote } from '../../entities/note/api/noteApi';
import { Button } from '../../shared/ui/Button';
import { Input, Textarea } from '../../shared/ui/Input';

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
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Заголовок…" />
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Текст заметки…" rows={3} />
      <Button type="submit" disabled={submitting || !title.trim()} className="self-start">
        Сохранить
      </Button>
    </form>
  );
}
