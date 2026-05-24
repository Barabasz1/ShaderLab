import { Topbar } from "@/components/layout/Topbar";
import { ProjectForm } from "@/components/projects/ProjectForm";
import keycloak from "@/lib/keycloak";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/createProject")({
  component: CreateProjectScreen,
});

export function CreateProjectScreen() {
  const navigate = useNavigate();

  const handleCreate = async (title: string, description: string) => {
    await keycloak.updateToken(30);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${keycloak.token}`,
      },
      body: JSON.stringify({ name: title, description }),
    });
    if (!res.ok) throw new Error("Failed to create project");
    const project = await res.json();
    navigate({ to: `/editor/${project.id}` });
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <ProjectForm
          heading="Create New Project"
          subheading="Set up a new shader experiment and choose a starting point."
          submitLabel="Create Project"
          cancelHref="/dashboard"
          onSubmit={handleCreate}
        />
      </div>
    </div>
  );
}
