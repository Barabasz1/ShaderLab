import { getGraphState, setGraphState } from "@/components/state/graphState";
import { getNodeDef } from "@/nodes/getNodeDef";
import { useEffect } from "react";

export function useKeyboardDelete(
  selectedNode: string | null,
  selectedEdge: string | null,
  setSelectedNode: (id: string | null) => void,
  setSelectedEdge: (id: string | null) => void,
  readOnly = false,
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const editing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (editing || (e.key !== "Delete" && e.key !== "Backspace")) return;

      if (selectedNode) {
        const node = getGraphState().nodes.find((n) => n.id === selectedNode);
        if (node && getNodeDef(node.type)?.deletable === false) return;

        e.preventDefault();
        setGraphState({
          nodes: getGraphState().nodes.filter(
            (node) => node.id !== selectedNode,
          ),
        });
        setGraphState({
          edges: getGraphState().edges.filter(
            (edge) => edge.src !== selectedNode && edge.tgt !== selectedNode,
          ),
        });
        setSelectedNode(null);
        return;
      }

      if (selectedEdge) {
        e.preventDefault();
        setGraphState({
          edges: getGraphState().edges.filter(
            (edge) => edge.id !== selectedEdge,
          ),
        });
        setSelectedEdge(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNode, selectedEdge, readOnly]);
}
