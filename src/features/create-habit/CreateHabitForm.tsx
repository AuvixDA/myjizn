import { useState, type FormEvent } from 'react';
import { createHabit } from '../../entities/habit/api/habitApi';
import { Button } from '../../shared/ui/Button';
import { Input, Select } from '../../shared/ui/Input';
import type { Habit } from '../../entities/habit/model/types';

export function CreateHabitForm() {
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<Habit['frequency']>('daily');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await createHabit({ title: title.trim(), frequency });
      setTitle('');
      setFrequency('daily');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Новая привычка…" className="flex-1" />
      <Select value={frequency} onChange={(e) => setFrequency(e.target.value as Habit['frequency'])} className="sm:w-36">
        <option value="daily">Каждый день</option>
        <option value="weekly">Раз в неделю</option>
      </Select>
      <Button type="submit" disabled={submitting || !title.trim()}>
        Добавить
      </Button>
    </form>
  );
}
