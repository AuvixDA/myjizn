import { useDiaryEntries } from '../../entities/diary/api/diaryApi';
import { TodayEntryForm } from '../../features/save-diary-entry/TodayEntryForm';
import { DiaryEntryCard } from '../../features/manage-diary/DiaryEntryCard';
import { Skeleton } from '../../shared/ui/Skeleton';

const TODAY = new Date().toISOString().slice(0, 10);

export function DiaryPage() {
  const { data: entries, isPending } = useDiaryEntries();
  const todayEntry = entries?.find((e) => e.date === TODAY);
  const pastEntries = entries?.filter((e) => e.date !== TODAY);

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Дневник</h1>
      {isPending ? <Skeleton className="h-40 w-full" /> : <TodayEntryForm existing={todayEntry} />}
      <div className="flex flex-col gap-2">
        {pastEntries?.map((entry, i) => (
          <DiaryEntryCard key={entry.id} entry={entry} delay={i * 0.04} />
        ))}
        {!isPending && pastEntries?.length === 0 && (
          <p className="text-white/40 text-sm">Пока нет записей за прошлые дни</p>
        )}
      </div>
    </div>
  );
}
