import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Link } from "@tanstack/react-router";
import keycloak from "@/lib/keycloak";
import { authFetch } from "@/lib/authFetch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

interface BackendProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    shaders: number;
  };
}

const getGradientForId = (id: string) => {
  const gradients = [
    "from-cyan-500 via-blue-500 to-indigo-500",
    "from-purple-600 via-fuchsia-500 to-pink-500",
    "from-emerald-400 via-green-500 to-teal-700",
    "from-orange-400 via-red-500 to-rose-600",
  ];
  const charCodeSum = id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return gradients[charCodeSum % gradients.length];
};

export function Dashboard() {
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!keycloak.authenticated) return;

      try {
        await keycloak.updateToken(30);

        const response = await fetch("/api/projects", {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch projects");

        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Could not load projects.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await authFetch(`/api/projects/${deletingId}`, { method: "DELETE" });
      setProjects((ps) => ps.filter((p) => p.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-1 flex-col p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Shaders</h1>
          <p className="text-muted-foreground mt-2">
            Manage and edit your creative coding projects.
          </p>
        </div>

        <Link to="/createProject">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-red-500 bg-red-500/10 p-4 rounded-md">{error}</div>
      ) : projects.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            You don't have any projects yet.
          </p>
          <Link to="/createProject">
            <Button variant="outline">Create your first project</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.name}
              description={project.description}
              lastModified={new Date(project.updatedAt).toLocaleDateString()}
              thumbnailGradient={getGradientForId(project.id)}
              onDelete={setDeletingId}
              onEdit={() => {}}
            />
          ))}
        </div>
      )}

      {deletingId && (
        <AlertDialog open onOpenChange={() => setDeletingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete project?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete{" "}
                <span className="font-medium text-foreground">
                  {projects.find((p) => p.id === deletingId)?.name}
                </span>{" "}
                and all its shaders. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
