import { Loader2 } from "lucide-react";
import { ProjectCard } from "./ProjectCard";
import { DashboardProps, getGradientForId } from "./Dashboard";
import { Pagination } from "./Pagination";

export function CommunityDashboard({
  title,
  subtitle,
  data,
  isLoading,
  error,
  page,
  pageSize,
  onPageChange,
}: DashboardProps) {
  const projects = data?.projects ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / pageSize);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-1 flex-col p-8 h-full overflow-hidden">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2">{subtitle}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-red-500 bg-red-500/10 p-4 rounded-md">
          {error.message}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No public projects yet.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.name}
                description={project.description}
                lastModified={new Date(project.updatedAt).toLocaleDateString()}
                thumbnailGradient={getGradientForId(project.id)}
                onDelete={() => {}}
                onEdit={() => {}}
                allowEdit={false}
              />
            ))}
          </div>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
