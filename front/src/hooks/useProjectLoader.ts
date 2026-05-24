import { syncUid } from "@/components/canvas/Canvas";
import { setGraphState } from "@/components/state/graphState";
import { authFetch } from "@/lib/authFetch";
import { useEffect, useState } from "react";

export function useProjectLoader(projectId: string) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authFetch(`/api/shaders/project/${projectId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        const nodes = data.graph?.nodes ?? [];
        const edges = data.graph?.edges ?? [];
        syncUid(nodes, edges);
        setGraphState({ nodes, edges, glslCode: data.code ?? "" });
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [projectId]);

  return { isLoading };
}