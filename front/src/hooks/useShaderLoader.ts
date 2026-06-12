import { syncUid } from "@/components/canvas/utils/makeId";
import { setGraphState } from "@/components/state/graphState";
import { authFetch } from "@/lib/authFetch";
import { useEffect, useState } from "react";

export function useShaderLoader(shaderId?: string) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!shaderId) {
      setGraphState({
        nodes: [],
        edges: [],
        glslCode: "",
        compileError: null,
        runtimeError: null,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    authFetch(`/api/shaders/${shaderId}`)
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
  }, [shaderId]);

  return { isLoading };
}
