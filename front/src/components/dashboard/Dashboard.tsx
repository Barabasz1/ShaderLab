import { type ChangeEvent, useRef, useState } from "react";
import { Plus, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Link } from "@tanstack/react-router";
import keycloak from "@/lib/keycloak";
import { authFetch } from "@/lib/authFetch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Pagination } from "./Pagination";
import { BackendProject } from "@/hooks/useProjects";
import { useQueryClient } from "@tanstack/react-query";



export const getGradientForId = (id: string) => {
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

export interface DashboardProps {
  title: string;
  subtitle: string;
  data:
  | {
    projects: BackendProject[];
    total: number;
  }
  | undefined;
  isLoading: boolean;
  error: Error | null;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  search: string,
  onSearchChange: (search: string) => void;
}

export function Dashboard({
  title,
  subtitle,
  data,
  isLoading,
  error,
  page,
  pageSize,
  onPageChange,
}: DashboardProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const projects = data?.projects ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / pageSize);

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const json = JSON.parse(await file.text());

      if (!Array.isArray(json?.nodes) || !Array.isArray(json?.edges)) {
        setImportError("Invalid project JSON");
        return;
      }

      const projectRes = await authFetch(`/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name.replace(/\.json$/i, ""),
        }),
      });
      if (!projectRes.ok) throw new Error("Failed to create project");

      const project = await projectRes.json();
      const projectId = project.id ?? project.projectId;
      if (!projectId) throw new Error("Failed to create project");

      const shaderRes = await authFetch(
        `/api/shaders/project/${projectId}/autosave`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            graph: { nodes: json.nodes, edges: json.edges },
            code: json.glslCode ?? "",
          }),
        },
      );

      if (!shaderRes.ok) throw new Error("Failed to import project");

      queryClient.invalidateQueries({ queryKey: ["projects", page] });
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Failed to import project");
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await authFetch(`/api/projects/${deletingId}`, { method: "DELETE" });
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ["projects", page] });
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-1 flex-col p-8 h-full overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImport}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Import
          </Button>
          <Link to="/createProject">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {importError && (
        <div className="text-red-500 bg-red-500/10 p-4 rounded-md mb-4">
          {importError}
        </div>
      )}

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
          <p className="text-muted-foreground mb-4">
            You don't have any projects yet.
          </p>
          <Link to="/createProject">
            <Button variant="outline">Create your first project</Button>
          </Link>
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
                onDelete={setDeletingId}
                onEdit={() => { }}
                allowEdit
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
