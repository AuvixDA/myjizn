import { useNotes } from '../../entities/note/api/noteApi';
import { CreateNoteForm } from '../../features/create-note/CreateNoteForm';
import { GlassCard } from '../../shared/ui/GlassCard';

export function NotesPage() {
  const { data: notes, refetch } = useNotes();

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Заметки</h1>
      <CreateNoteForm onCreated={() => refetch()} />
      <div className="grid gap-3 sm:grid-cols-2">
        {notes?.map((note, i) => (
          <GlassCard key={note.id} delay={i * 0.04} interactive>
            <p className="font-medium">{note.title}</p>
            <p className="text-sm text-white/50 mt-1 line-clamp-3">{note.content}</p>
          </GlassCard>
        ))}
        {notes?.length === 0 && <p className="text-white/40 text-sm">Пока нет заметок</p>}
      </div>
    </div>
  );
}
