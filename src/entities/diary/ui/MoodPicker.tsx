import { MOOD_EMOJI, MOOD_LABEL } from '../../../shared/config/labels';
import type { DiaryEntry } from '../model/types';

type Mood = NonNullable<DiaryEntry['mood']>;

const MOODS = Object.keys(MOOD_EMOJI) as Mood[];

interface MoodPickerProps {
  value?: Mood;
  onChange: (mood: Mood) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex gap-1.5">
      {MOODS.map((mood) => (
        <button
          key={mood}
          type="button"
          title={MOOD_LABEL[mood]}
          onClick={() => onChange(mood)}
          className={`flex items-center justify-center size-9 rounded-xl text-lg transition-colors ${
            value === mood ? 'bg-accent/25 ring-1 ring-accent/60' : 'bg-white/[0.04] hover:bg-white/[0.08]'
          }`}
        >
          {MOOD_EMOJI[mood]}
        </button>
      ))}
    </div>
  );
}
