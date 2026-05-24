import { useState } from "react";

export function useCanvasPan(
  wrapRef: React.RefObject<HTMLDivElement>,
  setSelectedNode: (id: string | null) => void,
  setSelectedEdge: (id: string | null) => void,
) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const onCanvasDown = (e: React.MouseEvent) => {
    if (
      e.target !== wrapRef.current &&
      (e.target as Element).id !== "edges-svg" &&
      !(e.target as Element).closest(".absolute")
    ) {
      setSelectedNode(null);
      setSelectedEdge(null);
      return;
    }
    if (e.button !== 0) return;
    setSelectedNode(null);
    setSelectedEdge(null);

    const sx = e.clientX - pan.x,
      sy = e.clientY - pan.y;
    const move = (ev: MouseEvent) =>
      setPan({ x: ev.clientX - sx, y: ev.clientY - sy });
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const onWheel = (e: React.WheelEvent) => {
    const f = e.deltaY < 0 ? 1.1 : 0.91;
    const rect = wrapRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left,
      my = e.clientY - rect.top;

    setZoom((z) => {
      const nz = Math.min(3, Math.max(0.15, z * f));
      setPan((p) => ({
        x: mx - (mx - p.x) * (nz / z),
        y: my - (my - p.y) * (nz / z),
      }));
      return nz;
    });
  };

  return { pan, zoom, setZoom, setPan, onCanvasDown, onWheel };
}
