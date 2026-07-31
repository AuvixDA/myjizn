import { useState } from 'react';
import { saveDiaryEntry, deleteDiaryEntry } from '../../entities/diary/api/diaryApi';
import { MoodPicker } from '../../entities/diary/ui/MoodPicker';
import { MOOD_EMOJI } from '../../shared/config/labels';
import type { DiaryEntry } from '../../entities/diary/model/types';
import { GlassCard } from '../../shared/ui/GlassCard';
import { Textarea } from '../../shared/ui/Input';
import { IconButton } from '../../shared/ui/IconButton';
import { Button } from '../../shared/ui/Button';
import { PencilIcon, TrashIcon } from '../../shared/ui/icons';

const DATE_FORMAT = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  delay?: number;
}

export function DiaryEntryCard({ entry, delay = 0 }: DiaryEntryCardProps) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(entry.content);
  const [mood, setMood] = useState(entry.mood);

  async function handleSave() {
    await saveDiaryEntry({ date: entry.date, content: content.trim(), mood });
    setEditing(false);
  }

  function handleCancel() {
    setContent(entry.content);
    setMood(entry.mood);
    setEditing(false);
  }

  function handleDelete() {
    if (window.confirm(`Удалить запись за ${DATE_FORMAT.format(new Date(entry.date))}?`)) void deleteDiaryEntry(entry.id);
  }

  return (
    <GlassCard delay={delay} className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/60">{DATE_FORMAT.format(new Date(entry.date))}</p>
        {editing ? (
          <MoodPicker value={mood} onChange={setMood} />
        ) : (
          <div className="flex items-center gap-1">
            {entry.mood && <span className="text-base">{MOOD_EMOJI[entry.mood]}</span>}
            <IconButton label="Редактировать" className="opacity-60 hover:opacity-100" onClick={() => setEditing(true)}>
              <PencilIcon className="size-3.5" />
            </IconButton>
            <IconButton label="Удалить" variant="danger" className="opacity-60 hover:opacity-100" onClick={handleDelete}>
              <TrashIcon className="size-3.5" />
            </IconButton>
          </div>
        )}
      </div>
      {editing ? (
        <>
          <Textarea aria-label="Текст записи" value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!content.trim()} className="text-xs px-3 py-1.5">
              Сохранить
            </Button>
            <Button variant="ghost" onClick={handleCancel} className="text-xs px-3 py-1.5">
              Отмена
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-white/70 whitespace-pre-wrap">{entry.content}</p>
      )}
    </GlassCard>
  );
}
