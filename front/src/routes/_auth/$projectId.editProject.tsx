import { Topbar } from "@/components/layout/Topbar";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { authFetch } from "@/lib/authFetch";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_auth/$projectId/editProject")({
  component: EditProjectScreen,
});

function EditProjectScreen() {
  const { projectId } = Route.useParams();
  const [defaults, setDefaults] = useState<{
    title: string;
    description: string;
    isPublic: boolean;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    authFetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) =>
        setDefaults({
          title: data.name ?? "",
          description: data.description ?? "",
          isPublic: data.isPublic ?? false,
        }),
      );
  }, [projectId]);

  const handleSave = async (
    title: string,
    description: string,
    isPublic: boolean,
  ) => {
    const res = await authFetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify({ name: title, description, isPublic }),
    });
    if (!res.ok) throw new Error("Failed to update");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full max-w-3xl mx-auto flex flex-col p-8 h-[calc(100vh-2.75rem)] overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
            <p className="text-muted-foreground mt-2">
              Update your project's details.
            </p>
          </div>
          {defaults ? (
            <ProjectForm
              defaultTitle={defaults.title}
              defaultDescription={defaults.description}
              defaultIsPublic={defaults.isPublic}
              submitLabel="Save changes"
              cancelHref="/dashboard"
              onSubmit={handleSave}
            />
          ) : (
            <div className="flex flex-1 justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
