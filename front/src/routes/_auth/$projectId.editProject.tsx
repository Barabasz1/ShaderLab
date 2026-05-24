import { Topbar } from "@/components/layout/Topbar";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { authFetch } from "@/lib/authFetch";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_auth/$projectId/editProject")({
  component: EditProjectScreen,
});

export function EditProjectScreen() {
  const { projectId } = Route.useParams();
  const [defaults, setDefaults] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    authFetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) =>
        setDefaults({
          title: data.name ?? "",
          description: data.description ?? "",
        }),
      );
  }, [projectId]);

  const handleSave = async (title: string, description: string) => {
    const res = await authFetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify({ name: title, description }),
    });
    if (!res.ok) throw new Error("Failed to update");
    navigate({ to: "/dashboard" });
  };

  if (!defaults) return <Loader2 className="animate-spin" />;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <ProjectForm
          defaultTitle={defaults.title}
          defaultDescription={defaults.description}
          heading="Edit Project"
          subheading="Update your project's details."
          submitLabel="Save changes"
          cancelHref="/dashboard"
          onSubmit={handleSave}
        />
      </div>
    </div>
  );
}
