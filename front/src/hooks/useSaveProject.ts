import { useGraphState } from "@/components/state/graphState";
import { authFetch } from "@/lib/authFetch";
import { useEffect, useRef, useState } from "react";
import keycloak from "@/lib/keycloak";

export function useSaveProject(projectId: string, autosaveMs: number = 2000) {
  const graph = useGraphState();
  const [isSaving, setIsSaving] = useState(false);
  const isFirstRender = useRef(true);

  const save = async () => {
    if (!keycloak.authenticated) return;
    setIsSaving(true);
    try {
      const res = await authFetch(
        `/api/shaders/project/${projectId}/autosave`,
        {
          method: "PATCH",
          body: JSON.stringify({
            graph: { nodes: graph.nodes, edges: graph.edges },
            code: graph.glslCode,
          }),
        },
      );
      if (!res.ok) throw new Error("Failed to save");
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(save, autosaveMs);
    return () => clearTimeout(timer);
  }, [graph.nodes, graph.edges, graph.glslCode]);

  return { save, isSaving };
}
