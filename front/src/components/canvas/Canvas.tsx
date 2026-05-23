import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NodeCard } from "./NodeCard";
import { canConnectPortTypes, nodeDefs } from "@/nodes/nodeDefs";
import {
  setGraphState,
  type ControlValue,
} from "@/components/state/graphState";
import { Badge } from "../ui/badge";
import { Maximize2, Minus, Plus } from "lucide-react";

let uid = 100;
const mkid = () => String(++uid);

function cubicBez(x1: number, y1: number, x2: number, y2: number) {
  const cx = (x1 + x2) / 2;
  return `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
}

const getNodeDef = (type: string) => nodeDefs[type];

const getControlValues = (type: string) => {
  const def = nodeDefs[type];
  const values: Record<string, ControlValue> = {};

  if (!def) return values;

  def.controls.forEach((control) => {
    values[control.id] = control.default;
  });

  return values;
};

export function Canvas() {
  const [nodes, setNodes] = useState([
    {
      id: "uv",
      type: "uv",
      x: 40,
      y: 120,
      controlValues: {},
      inlineValues: {},
    },
    {
      id: "output",
      type: "output",
      x: 520,
      y: 120,
      controlValues: {},
      inlineValues: {},
    },
  ]);

  const [edges, setEdges] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [connecting, setConnecting] = useState<any>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const wrapRef = useRef<HTMLDivElement>(null);
  const anchorRefs = useRef<Record<string, HTMLDivElement>>({});

  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});

    const handleResize = () => forceUpdate({});
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setGraphState({ nodes, edges });
  }, [nodes, edges]);

  const toWorld = (sx: number, sy: number) => ({
    x: (sx - pan.x) / zoom,
    y: (sy - pan.y) / zoom,
  });

  const anchorCenter = (nodeId: string, side: string, port: string) => {
    const key = `${nodeId}:${side}:${port}`;
    const el = anchorRefs.current[key];
    const wrap = wrapRef.current;
    if (!el || !wrap) return null;
    const er = el.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    return {
      x: er.left + er.width / 2 - wr.left,
      y: er.top + er.height / 2 - wr.top,
    };
  };

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

    const node = nodes.find((n) => n.id === id)!;
    const ox = node.x,
      oy = node.y;
    const sx = e.clientX,
      sy = e.clientY;

    const move = (ev: MouseEvent) => {
      const dx = (ev.clientX - sx) / zoom,
        dy = (ev.clientY - sy) / zoom;
      setNodes((ns) =>
        ns.map((n) => (n.id === id ? { ...n, x: ox + dx, y: oy + dy } : n)),
      );
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

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

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const raw = e.dataTransfer.getData("application/nodeflow");
    if (!raw) return;

    const item = JSON.parse(raw);

    const rect = wrapRef.current!.getBoundingClientRect();

    const { x, y } = toWorld(e.clientX - rect.left, e.clientY - rect.top);

    setNodes((ns) => [
      ...ns,
      {
        id: mkid(),
        type: item.type,
        x: x - 90,
        y: y - 35,
        controlValues: getControlValues(item.type),
        inlineValues: {},
      },
    ]);
  };

  const onAnchorDown = (
    e: React.MouseEvent,
    nodeId: string,
    port: string,
    side: string,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const c = anchorCenter(nodeId, side, port);
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

  const getPortType = (nodeId: string, side: string, port: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    const def = node ? getNodeDef(node.type) : null;
    const ports = side === "out" ? def?.outputs : def?.inputs;
    return ports?.find((p) => p.id === port)?.type ?? null;
  };

  const onAnchorUp = (
    e: React.MouseEvent,
    nodeId: string,
    port: string,
    side: string,
  ) => {
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

    setEdges((es) => [
      ...es.filter(
        (edge) => !(edge.tgt === tgt.nodeId && edge.tgtPort === tgt.port),
      ),
      {
        id: mkid(),
        src: src.nodeId,
        srcPort: src.port,
        tgt: tgt.nodeId,
        tgtPort: tgt.port,
      },
    ]);
  };

  const onControlChange = useCallback(
    (nodeId: string, controlId: string, value: ControlValue) => {
      setNodes((ns) =>
        ns.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                controlValues: {
                  ...(node.controlValues ?? {}),
                  [controlId]: value,
                },
              }
            : node,
        ),
      );
    },
    [],
  );

  const onInlineValueChange = useCallback(
    (nodeId: string, inputId: string, value: ControlValue) => {
      setNodes((ns) =>
        ns.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                inlineValues: {
                  ...(node.inlineValues ?? {}),
                  [inputId]: value,
                },
              }
            : node,
        ),
      );
    },
    [],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const editing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (editing || (e.key !== "Delete" && e.key !== "Backspace")) return;

      if (selectedNode) {
        const node = nodes.find((n) => n.id === selectedNode);
        if (node && getNodeDef(node.type)?.deletable === false) return;

        e.preventDefault();
        setNodes((ns) => ns.filter((node) => node.id !== selectedNode));
        setEdges((es) =>
          es.filter(
            (edge) => edge.src !== selectedNode && edge.tgt !== selectedNode,
          ),
        );
        setSelectedNode(null);
        return;
      }

      if (selectedEdge) {
        e.preventDefault();
        setEdges((es) => es.filter((edge) => edge.id !== selectedEdge));
        setSelectedEdge(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, selectedNode, selectedEdge]);

  const edgePoints = (edge: any) => {
    const sp = anchorCenter(edge.src, "out", edge.srcPort);
    const tp = anchorCenter(edge.tgt, "in", edge.tgtPort);
    return { sp, tp };
  };

  const connectedPortsMap: Record<string, Set<string>> = {};
  edges.forEach((e) => {
    if (!connectedPortsMap[e.src]) connectedPortsMap[e.src] = new Set();
    if (!connectedPortsMap[e.tgt]) connectedPortsMap[e.tgt] = new Set();
    connectedPortsMap[e.src].add(`out:${e.srcPort}`);
    connectedPortsMap[e.tgt].add(`in:${e.tgtPort}`);
  });

  const nodeTransform = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;

  return (
    <div
      id="canvas"
      ref={wrapRef}
      className={`flex-1 relative overflow-hidden bg-background bg-[radial-gradient(circle,hsl(var(--dot-color))_1px,transparent_1px)] bg-size-[20px_20px] ${connecting ? "cursor-crosshair" : "cursor-default"}`}
      onMouseDown={onCanvasDown}
      onWheel={onWheel}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <svg
        id="edges-svg"
        className="absolute inset-0 overflow-visible pointer-events-none z-0 w-full h-full"
      >
        <g style={{ transform: nodeTransform, transformOrigin: "0 0" }}></g>

        {edges.map((edge) => {
          const { sp, tp } = edgePoints(edge);
          if (!sp || !tp) return null;
          const d = cubicBez(sp.x, sp.y, tp.x, tp.y);
          const selectEdge = (e: React.MouseEvent) => {
            e.stopPropagation();
            setSelectedEdge(edge.id);
            setSelectedNode(null);
          };

          return (
            <g key={edge.id}>
              <path
                className="fill-none stroke-transparent stroke-[16px] pointer-events-auto cursor-pointer"
                d={d}
                onMouseDown={selectEdge}
              />
              <path
                className={`fill-none stroke-[3px] pointer-events-none ${
                  selectedEdge === edge.id
                    ? "stroke-blue-600"
                    : "stroke-slate-300"
                }`}
                d={d}
              />
            </g>
          );
        })}

        {connecting && (
          <path
            className="fill-none stroke-blue-500 stroke-2 opacity-70"
            strokeDasharray="6 3"
            d={cubicBez(connecting.ax, connecting.ay, mouse.x, mouse.y)}
          />
        )}
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: nodeTransform,
          transformOrigin: "0 0",
          pointerEvents: "none",
        }}
      >
        {nodes.map((node) => (
          <div
            key={node.id}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "all",
            }}
          >
            <NodeCard
              node={node}
              selected={selectedNode === node.id}
              onNodeDown={onNodeDown}
              onHeaderDown={onNodeHeaderDown}
              onAnchorDown={onAnchorDown}
              onAnchorUp={onAnchorUp}
              onControlChange={onControlChange}
              onInlineValueChange={onInlineValueChange}
              anchorRefs={anchorRefs}
              connectedPorts={connectedPortsMap[node.id]}
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-4 flex flex-col bg-background/80 backdrop-blur-md border rounded-md shadow-sm overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none border-b hover:bg-muted"
          onClick={() => setZoom((z) => Math.min(3, z * 1.2))}
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none border-b hover:bg-muted"
          onClick={() => setZoom((z) => Math.max(0.15, z / 1.2))}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none hover:bg-muted"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
        >
          <Maximize2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="absolute bottom-3.5 right-3.5 h-24 w-37 overflow-hidden rounded-s border border-border bg-background shadow-sm">
        <svg
          width="148"
          height="96"
          viewBox="-40 -30 800 500"
          style={{ pointerEvents: "none" }}
        >
          {nodes.map((n) => {
            const def = getNodeDef(n.type);

            const cat = def?.category ?? {
              color: "hsl(215,20%,45%)",
            };
            return (
              <rect
                key={n.id}
                x={n.x}
                y={n.y}
                width={180}
                height={72}
                rx={4}
                fill={cat.color}
                opacity={selectedNode === n.id ? 0.9 : 0.4}
              />
            );
          })}
        </svg>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
        <Badge
          variant="outline"
          className="font-mono bg-background/80 backdrop-blur-md text-muted-foreground"
        >
          {Math.round(zoom * 100)}%
        </Badge>
      </div>
    </div>
  );
}
