import { useState, type FormEvent } from 'react';
import { createTask } from '../../entities/task/api/taskApi';
import { useGoals } from '../../entities/goal/api/goalApi';
import { useProjects } from '../../entities/project/api/projectApi';
import { Button } from '../../shared/ui/Button';
import { Input, Select } from '../../shared/ui/Input';
import type { EntityId, Relation } from '../../shared/types/entity';

interface CreateTaskFormProps {
  onCreated?: () => void;
}

export function CreateTaskForm({ onCreated }: CreateTaskFormProps) {
  const { data: goals } = useGoals();
  const { data: projects } = useProjects();
  const [title, setTitle] = useState('');
  const [goalId, setGoalId] = useState<EntityId | ''>('');
  const [projectId, setProjectId] = useState<EntityId | ''>('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const relations: Relation[] = [];
      if (goalId) relations.push({ targetId: goalId, targetType: 'goal', type: 'supports' });
      if (projectId) relations.push({ targetId: projectId, targetType: 'project', type: 'part-of' });

      await createTask({ title: title.trim(), relations: relations.length ? relations : undefined });
      setTitle('');
      setGoalId('');
      setProjectId('');
      onCreated?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Новая задача…" className="flex-1" />
      {goals && goals.length > 0 && (
        <Select value={goalId} onChange={(e) => setGoalId(e.target.value)} className="sm:w-44">
          <option value="">Без цели</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </Select>
      )}
      {projects && projects.length > 0 && (
        <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="sm:w-44">
          <option value="">Без проекта</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </Select>
      )}
      <Button type="submit" disabled={submitting || !title.trim()}>
        Добавить
      </Button>
    </form>
  );
}
