import { useState } from 'react';
import { motion } from 'framer-motion';
import { updateGoalTitle, deleteGoal } from '../../entities/goal/api/goalApi';
import type { Goal } from '../../entities/goal/model/types';
import { GlassCard } from '../../shared/ui/GlassCard';
import { Input } from '../../shared/ui/Input';
import { IconButton } from '../../shared/ui/IconButton';
import { PencilIcon, TrashIcon, CheckIcon, XIcon } from '../../shared/ui/icons';
import { GOAL_STATUS_LABEL } from '../../shared/config/labels';

interface GoalCardProps {
  goal: Goal;
  delay?: number;
}

export function GoalCard({ goal, delay = 0 }: GoalCardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(goal.title);

  async function handleSave() {
    const trimmed = title.trim();
    if (trimmed && trimmed !== goal.title) await updateGoalTitle(goal.id, trimmed);
    setEditing(false);
  }

  function handleCancel() {
    setTitle(goal.title);
    setEditing(false);
  }

  function handleDelete() {
    if (window.confirm(`Удалить цель «${goal.title}»?`)) void deleteGoal(goal.id);
  }

  return (
    <GlassCard delay={delay}>
      <div className="flex items-center justify-between gap-2 mb-2">
        {editing ? (
          <form
            className="flex flex-1 items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
          >
            <Input
              autoFocus
              aria-label="Название цели"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 py-1.5"
            />
            <IconButton type="submit" label="Сохранить">
              <CheckIcon className="size-4" />
            </IconButton>
            <IconButton type="button" label="Отмена" onClick={handleCancel}>
              <XIcon className="size-4" />
            </IconButton>
          </form>
        ) : (
          <>
            <div className="min-w-0">
              <p className="font-medium truncate">{goal.title}</p>
              <p className="text-xs text-white/55">{GOAL_STATUS_LABEL[goal.status]}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-sm text-white/60 tabular-nums mr-1">{goal.progress}%</span>
              <IconButton label="Редактировать" className="opacity-60 hover:opacity-100" onClick={() => setEditing(true)}>
                <PencilIcon className="size-3.5" />
              </IconButton>
              <IconButton label="Удалить" variant="danger" className="opacity-60 hover:opacity-100" onClick={handleDelete}>
                <TrashIcon className="size-3.5" />
              </IconButton>
            </div>
          </>
        )}
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${goal.progress}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-accent-dim to-accent-soft"
        />
      </div>
    </GlassCard>
  );
}
