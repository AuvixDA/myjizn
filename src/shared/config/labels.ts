import type { EntityKind } from '../types/entity';
import type { Goal } from '../../entities/goal/model/types';
import type { DiaryEntry } from '../../entities/diary/model/types';

export const ENTITY_KIND_LABEL: Record<EntityKind, string> = {
  goal: 'Цель',
  task: 'Задача',
  habit: 'Привычка',
  diary: 'Дневник',
  note: 'Заметка',
  finance: 'Финансы',
  project: 'Проект',
};

export const GOAL_STATUS_LABEL: Record<Goal['status'], string> = {
  active: 'Активна',
  paused: 'На паузе',
  completed: 'Завершена',
  archived: 'В архиве',
};

export const MOOD_EMOJI: Record<NonNullable<DiaryEntry['mood']>, string> = {
  great: '😄',
  good: '🙂',
  neutral: '😐',
  bad: '🙁',
  terrible: '😞',
};

export const MOOD_LABEL: Record<NonNullable<DiaryEntry['mood']>, string> = {
  great: 'Отлично',
  good: 'Хорошо',
  neutral: 'Нормально',
  bad: 'Плохо',
  terrible: 'Ужасно',
};
