import type { EntityKind } from '../types/entity';
import type { Goal } from '../../entities/goal/model/types';

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
