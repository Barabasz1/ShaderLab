import { Topbar } from "@/components/layout/Topbar";
import { ProjectForm } from "@/components/projects/ProjectForm";
import keycloak from "@/lib/keycloak";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/createProject")({
  component: CreateProjectScreen,
});

function CreateProjectScreen() {
  const navigate = useNavigate();

  const handleCreate = async (
    title: string,
    description: string,
    isPublic: boolean,
  ) => {
    await keycloak.updateToken(30);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${keycloak.token}`,
      },
      body: JSON.stringify({ name: title, description, isPublic }),
    });
    if (!res.ok) throw new Error("Failed to create project");
    const project = await res.json();
    navigate({ to: `/${project.id}/editor` });
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full max-w-3xl mx-auto flex flex-col p-8 h-[calc(100vh-2.75rem)] overflow-y-auto">
          {" "}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
            <p className="text-muted-foreground mt-2">
              Update your project's details.
            </p>
          </div>
          <ProjectForm
            submitLabel="Create Project"
            cancelHref="/dashboard"
            onSubmit={handleCreate}
          />
        </div>
      </div>
    </div>
  );
}
