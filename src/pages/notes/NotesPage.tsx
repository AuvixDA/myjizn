import { useNotes } from '../../entities/note/api/noteApi';
import { CreateNoteForm } from '../../features/create-note/CreateNoteForm';
import { NoteCard } from '../../features/manage-note/NoteCard';
import { Skeleton } from '../../shared/ui/Skeleton';

export function NotesPage() {
  const { data: notes, isPending } = useNotes();

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Заметки</h1>
      <CreateNoteForm />
      <div className="grid gap-3 sm:grid-cols-2">
        {isPending && (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        )}
        {notes?.map((note, i) => (
          <NoteCard key={note.id} note={note} delay={i * 0.04} />
        ))}
        {notes?.length === 0 && <p className="text-white/55 text-sm">Пока нет заметок</p>}
      </div>
    </div>
  );
}
