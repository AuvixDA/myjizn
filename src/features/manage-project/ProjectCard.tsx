import { useState } from 'react';
import {
  updateProjectTitle,
  updateProjectStatus,
  deleteProject,
  getLinkedTaskCount,
} from '../../entities/project/api/projectApi';
import type { Project } from '../../entities/project/model/types';
import { GlassCard } from '../../shared/ui/GlassCard';
import { Input, Select } from '../../shared/ui/Input';
import { IconButton } from '../../shared/ui/IconButton';
import { PencilIcon, TrashIcon, CheckIcon, XIcon } from '../../shared/ui/icons';
import { PROJECT_STATUS_LABEL } from '../../shared/config/labels';
import { pluralizeRu } from '../../shared/lib/pluralize';

interface ProjectCardProps {
  project: Project;
  delay?: number;
}

export function ProjectCard({ project, delay = 0 }: ProjectCardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const linkedTaskCount = getLinkedTaskCount(project.id);

  async function handleSave() {
    const trimmed = title.trim();
    if (trimmed && trimmed !== project.title) await updateProjectTitle(project.id, trimmed);
    setEditing(false);
  }

  function handleCancel() {
    setTitle(project.title);
    setEditing(false);
  }

  function handleDelete() {
    if (window.confirm(`Удалить проект «${project.title}»?`)) void deleteProject(project.id);
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
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{project.title}</p>
            <p className="text-xs text-white/40">
              {linkedTaskCount > 0
                ? `${linkedTaskCount} ${pluralizeRu(linkedTaskCount, ['задача', 'задачи', 'задач'])}`
                : 'Нет связанных задач'}
            </p>
          </div>
          <Select
            value={project.status}
            onChange={(e) => updateProjectStatus(project.id, e.target.value as Project['status'])}
            className="w-32 py-1.5 text-xs shrink-0"
          >
            {(Object.keys(PROJECT_STATUS_LABEL) as Project['status'][]).map((status) => (
              <option key={status} value={status}>
                {PROJECT_STATUS_LABEL[status]}
              </option>
            ))}
          </Select>
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
