import { useProjects } from '../../entities/project/api/projectApi';
import { CreateProjectForm } from '../../features/create-project/CreateProjectForm';
import { ProjectCard } from '../../features/manage-project/ProjectCard';
import { Skeleton } from '../../shared/ui/Skeleton';

export function ProjectsPage() {
  const { data: projects, isPending } = useProjects();

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Проекты</h1>
      <CreateProjectForm />
      <div className="flex flex-col gap-2">
        {isPending && (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        )}
        {projects?.map((project, i) => (
          <ProjectCard key={project.id} project={project} delay={i * 0.04} />
        ))}
        {projects?.length === 0 && <p className="text-white/55 text-sm">Пока нет проектов</p>}
      </div>
    </div>
  );
}
