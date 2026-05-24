import { getGraphState, setGraphState } from "@/components/state/graphState";

export function useNodeDrag(
  zoom: number,
  setSelectedNode: (id: string | null) => void,
  setSelectedEdge: (id: string | null) => void,
) {
  const onNodeDown = (e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedNode(id);
    setSelectedEdge(null);
  };

  const onNodeHeaderDown = (e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedNode(id);
    setSelectedEdge(null);

    const node = getGraphState().nodes.find((n) => n.id === id)!;
    const ox = node.x,
      oy = node.y;
    const sx = e.clientX,
      sy = e.clientY;

    const move = (ev: MouseEvent) => {
      const dx = (ev.clientX - sx) / zoom,
        dy = (ev.clientY - sy) / zoom;
      setGraphState({
        nodes: getGraphState().nodes.map((n) =>
          n.id === id ? { ...n, x: ox + dx, y: oy + dy } : n,
        ),
      });
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return { onNodeDown, onNodeHeaderDown };
}
