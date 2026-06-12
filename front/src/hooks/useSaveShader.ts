import { useGraphState } from "@/components/state/graphState";
import { authFetch } from "@/lib/authFetch";
import { useEffect, useRef, useState } from "react";
import keycloak from "@/lib/keycloak";

export function useSaveShader(shaderId?: string, autosaveMs: number = 2000) {
  const graph = useGraphState();
  const [isSaving, setIsSaving] = useState(false);
  const isFirstRender = useRef(true);
  const currentShaderId = useRef(shaderId);

  const save = async () => {
    if (!keycloak.authenticated || !shaderId) return;
    setIsSaving(true);
    try {
      const res = await authFetch(`/api/shaders/${shaderId}/autosave`, {
        method: "PATCH",
        body: JSON.stringify({
          graph: { nodes: graph.nodes, edges: graph.edges },
          code: graph.glslCode,
        }),
      });
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
      currentShaderId.current = shaderId;
      return;
    }
    if (currentShaderId.current !== shaderId) {
      currentShaderId.current = shaderId;
      return;
    }
    const timer = setTimeout(save, autosaveMs);
    return () => clearTimeout(timer);
  }, [graph.nodes, graph.edges, graph.glslCode, shaderId]);

  return { save, isSaving };
}
