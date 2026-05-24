import { useState } from "react";
import { anchorCenter } from "../utils/anchorCenter";
import { getGraphState, setGraphState } from "@/components/state/graphState";
import { canConnectPortTypes } from "@/nodes/nodeDefs";
import { makeId } from "../utils/makeId";
import { getNodeDef } from "@/nodes/getNodeDef";

const getPortType = (nodeId: string, side: string, port: string) => {
  const node = getGraphState().nodes.find((n) => n.id === nodeId);
  const def = node ? getNodeDef(node.type) : null;
  const ports = side === "out" ? def?.outputs : def?.inputs;
  return ports?.find((p) => p.id === port)?.type ?? null;
};

export function useEdgeConnect(
  wrapRef: React.RefObject<HTMLDivElement>,
  anchorRefs: React.RefObject<Record<string, HTMLDivElement>>,
  readOnly: boolean,
) {
  const [connecting, setConnecting] = useState<any>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const onAnchorDown = (
    e: React.MouseEvent,
    nodeId: string,
    port: string,
    side: string,
  ) => {
    if (readOnly) return;
    
    e.stopPropagation();
    e.preventDefault();

    const c = anchorCenter(nodeId, side, port, anchorRefs, wrapRef);
    if (!c) return;

    setConnecting({ nodeId, port, side, ax: c.x, ay: c.y });

    const wr = wrapRef.current!.getBoundingClientRect();
    setMouse({ x: e.clientX - wr.left, y: e.clientY - wr.top });

    const move = (ev: MouseEvent) => {
      const r = wrapRef.current!.getBoundingClientRect();
      setMouse({ x: ev.clientX - r.left, y: ev.clientY - r.top });
    };
    const up = () => {
      setConnecting(null);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const onAnchorUp = (
    e: React.MouseEvent,
    nodeId: string,
    port: string,
    side: string,
  ) => {
    if (readOnly) return;

    if (!connecting || connecting.nodeId === nodeId) return;
    let src, tgt;
    if (connecting.side === "out" && side === "in") {
      src = { nodeId: connecting.nodeId, port: connecting.port };
      tgt = { nodeId, port };
    } else if (connecting.side === "in" && side === "out") {
      src = { nodeId, port };
      tgt = { nodeId: connecting.nodeId, port: connecting.port };
    } else return;

    const sourceType = getPortType(src.nodeId, "out", src.port);
    const targetType = getPortType(tgt.nodeId, "in", tgt.port);
    if (
      sourceType &&
      targetType &&
      !canConnectPortTypes(sourceType, targetType)
    )
      return;

    setGraphState({
      edges: [
        ...getGraphState().edges.filter(
          (edge) => !(edge.tgt === tgt.nodeId && edge.tgtPort === tgt.port),
        ),
        {
          id: makeId(),
          src: src.nodeId,
          srcPort: src.port,
          tgt: tgt.nodeId,
          tgtPort: tgt.port,
        },
      ],
    });
  };

  return {
    connecting,
    setConnecting,
    mouse,
    setMouse,
    onAnchorDown,
    onAnchorUp,
  };
}
