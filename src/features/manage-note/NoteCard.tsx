import { useState } from 'react';
import { updateNote, deleteNote } from '../../entities/note/api/noteApi';
import type { Note } from '../../entities/note/model/types';
import { GlassCard } from '../../shared/ui/GlassCard';
import { Input, Textarea } from '../../shared/ui/Input';
import { IconButton } from '../../shared/ui/IconButton';
import { Button } from '../../shared/ui/Button';
import { PencilIcon, TrashIcon } from '../../shared/ui/icons';

interface NoteCardProps {
  note: Note;
  delay?: number;
}

export function NoteCard({ note, delay = 0 }: NoteCardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  async function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    await updateNote(note.id, { title: trimmedTitle, content: content.trim() });
    setEditing(false);
  }

  function handleCancel() {
    setTitle(note.title);
    setContent(note.content);
    setEditing(false);
  }

  function handleDelete() {
    if (window.confirm(`Удалить заметку «${note.title}»?`)) void deleteNote(note.id);
  }

  if (editing) {
    return (
      <GlassCard delay={delay}>
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
        >
          <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
          <div className="flex gap-2">
            <Button type="submit" disabled={!title.trim()} className="text-xs px-3 py-1.5">
              Сохранить
            </Button>
            <Button type="button" variant="ghost" onClick={handleCancel} className="text-xs px-3 py-1.5">
              Отмена
            </Button>
          </div>
        </form>
      </GlassCard>
    );
  }

  return (
    <GlassCard delay={delay} interactive>
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium min-w-0 truncate">{note.title}</p>
        <div className="flex items-center gap-1 shrink-0">
          <IconButton label="Редактировать" className="opacity-60 hover:opacity-100" onClick={() => setEditing(true)}>
            <PencilIcon className="size-3.5" />
          </IconButton>
          <IconButton label="Удалить" variant="danger" className="opacity-60 hover:opacity-100" onClick={handleDelete}>
            <TrashIcon className="size-3.5" />
          </IconButton>
        </div>
      </div>
      <p className="text-sm text-white/50 mt-1 line-clamp-3">{note.content}</p>
    </GlassCard>
  );
}
