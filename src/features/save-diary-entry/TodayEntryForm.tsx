import { useEffect, useState } from 'react';
import { saveDiaryEntry } from '../../entities/diary/api/diaryApi';
import { MoodPicker } from '../../entities/diary/ui/MoodPicker';
import type { DiaryEntry } from '../../entities/diary/model/types';
import { GlassCard } from '../../shared/ui/GlassCard';
import { Textarea } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';

const TODAY = new Date().toISOString().slice(0, 10);

interface TodayEntryFormProps {
  existing?: DiaryEntry;
}

export function TodayEntryForm({ existing }: TodayEntryFormProps) {
  const [content, setContent] = useState(existing?.content ?? '');
  const [mood, setMood] = useState<DiaryEntry['mood']>(existing?.mood);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Syncs local draft state once the existing entry loads asynchronously
  // (Dexie query resolves after first render) — without this the textarea
  // would stay empty even though today already has a saved entry.
  useEffect(() => {
    if (existing) {
      setContent(existing.content);
      setMood(existing.mood);
    }
  }, [existing]);

  async function handleSave() {
    setSaving(true);
    try {
      await saveDiaryEntry({ date: TODAY, content: content.trim(), mood });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassCard className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs text-white/60">Сегодня</h2>
        <MoodPicker value={mood} onChange={setMood} />
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Как прошёл день?"
        rows={4}
      />
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving || !content.trim()} className="self-start">
          Сохранить
        </Button>
        {saved && <span className="text-xs text-white/55">Сохранено</span>}
      </div>
    </GlassCard>
  );
}
