import { motion } from 'framer-motion';
import { useGoals, useGoalEventsSync } from '../../entities/goal/api/goalApi';
import { CreateGoalForm } from '../../features/create-goal/CreateGoalForm';
import { GlassCard } from '../../shared/ui/GlassCard';
import { GOAL_STATUS_LABEL } from '../../shared/config/labels';

export function GoalsPage() {
  useGoalEventsSync();
  const { data: goals } = useGoals();

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Цели</h1>
      <CreateGoalForm />
      <div className="flex flex-col gap-2">
        {goals?.map((goal, i) => (
          <GlassCard key={goal.id} delay={i * 0.04}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium">{goal.title}</p>
                <p className="text-xs text-white/40">{GOAL_STATUS_LABEL[goal.status]}</p>
              </div>
              <span className="text-sm text-white/60 tabular-nums">{goal.progress}%</span>
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
        ))}
        {goals?.length === 0 && <p className="text-white/40 text-sm">Пока нет целей</p>}
      </div>
    </div>
  );
}
