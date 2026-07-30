import { useState } from 'react';
import { toggleHabitToday, updateHabitTitle, deleteHabit } from '../../entities/habit/api/habitApi';
import { todayKey } from '../../entities/habit/model/streak';
import type { Habit } from '../../entities/habit/model/types';
import { GlassCard } from '../../shared/ui/GlassCard';
import { Checkbox } from '../../shared/ui/Checkbox';
import { Input } from '../../shared/ui/Input';
import { IconButton } from '../../shared/ui/IconButton';
import { PencilIcon, TrashIcon, CheckIcon, XIcon, FlameIcon } from '../../shared/ui/icons';

const DAY_MS = 24 * 60 * 60 * 1000;

function lastSevenDayKeys(): string[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => todayKey(new Date(start.getTime() - (6 - i) * DAY_MS)));
}

interface HabitCardProps {
  habit: Habit;
  delay?: number;
}

export function HabitCard({ habit, delay = 0 }: HabitCardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(habit.title);
  const doneToday = habit.checkedDates.includes(todayKey());

  async function handleSave() {
    const trimmed = title.trim();
    if (trimmed && trimmed !== habit.title) await updateHabitTitle(habit.id, trimmed);
    setEditing(false);
  }

  function handleCancel() {
    setTitle(habit.title);
    setEditing(false);
  }

  function handleDelete() {
    if (window.confirm(`Удалить привычку «${habit.title}»?`)) void deleteHabit(habit.id);
  }

  return (
    <GlassCard delay={delay}>
      {editing ? (
        <form
          className="flex items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
        >
          <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 py-1.5" />
          <IconButton type="submit" label="Сохранить">
            <CheckIcon className="size-4" />
          </IconButton>
          <IconButton type="button" label="Отмена" onClick={handleCancel}>
            <XIcon className="size-4" />
          </IconButton>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <Checkbox checked={doneToday} onChange={() => toggleHabitToday(habit.id)} />
          <div className="flex-1 min-w-0">
            <p className="truncate">{habit.title}</p>
            <p className="text-xs text-white/40">{habit.frequency === 'daily' ? 'Каждый день' : 'Раз в неделю'}</p>
          </div>
          {habit.streak > 0 && (
            <span className="flex items-center gap-1 text-xs text-orange-300 shrink-0">
              <FlameIcon className="size-3.5" />
              {habit.streak}
            </span>
          )}
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            {lastSevenDayKeys().map((key) => (
              <span
                key={key}
                className={`size-2 rounded-full ${habit.checkedDates.includes(key) ? 'bg-accent-soft' : 'bg-white/10'}`}
              />
            ))}
          </div>
          <IconButton label="Редактировать" className="opacity-60 hover:opacity-100" onClick={() => setEditing(true)}>
            <PencilIcon className="size-3.5" />
          </IconButton>
          <IconButton label="Удалить" variant="danger" className="opacity-60 hover:opacity-100" onClick={handleDelete}>
            <TrashIcon className="size-3.5" />
          </IconButton>
        </div>
      )}
    </GlassCard>
  );
}
