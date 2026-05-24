import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import { Button } from "@/components/ui/button";
import { NodeCard } from "./NodeCard";
import { nodeDefs } from "@/nodes/nodeDefs";
import {
  getGraphState,
  setGraphState,
  useGraphState,
  type ControlValue,
} from "@/components/state/graphState";
import { Badge } from "../ui/badge";
import { Maximize2, Minus, Plus } from "lucide-react";
import { useCanvasPan } from "./hooks/useCanvasPan";
import { useEdgeConnect } from "./hooks/useEdgeConnect";
import { anchorCenter } from "./utils/anchorCenter";
import { makeId } from "./utils/makeId";
import { useNodeDrag } from "./hooks/useNodeDrag";
import { useNodeChange } from "./hooks/useNodeChange";
import { useKeyboardDelete } from "./hooks/useKeyboardDelete";

function cubicBez(x1: number, y1: number, x2: number, y2: number) {
  const cx = (x1 + x2) / 2;
  return `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
}

const getControlValues = (type: string) => {
  const def = nodeDefs[type];
  const values: Record<string, ControlValue> = {};

  if (!def) return values;

  def.controls.forEach((control) => {
    values[control.id] = control.default;
  });

  return values;
};

interface CanvasProps {
  readOnly: boolean;
}

export function Canvas({ readOnly = false }: CanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const anchorRefs = useRef<Record<string, HTMLDivElement>>({});

  const { nodes, edges } = useGraphState();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const { pan, zoom, setZoom, setPan, onCanvasDown, onWheel } = useCanvasPan(
    wrapRef,
    setSelectedNode,
    setSelectedEdge,
  );
  const { connecting, mouse, onAnchorDown, onAnchorUp } = useEdgeConnect(
    wrapRef,
    anchorRefs,
    readOnly,
  );
  const { onNodeDown, onNodeHeaderDown } = useNodeDrag(
    zoom,
    setSelectedNode,
    setSelectedEdge,
    readOnly,
  );
  const { onControlChange, onInlineValueChange } = useNodeChange(readOnly);
  useKeyboardDelete(
    selectedNode,
    selectedEdge,
    setSelectedNode,
    setSelectedEdge,
    readOnly,
  );

  const [, forceUpdate] = useState({});

  useLayoutEffect(() => {
    forceUpdate({});
  }, [pan, zoom, nodes]);

  useEffect(() => {
    forceUpdate({});

    const handleResize = () => forceUpdate({});
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toWorld = (sx: number, sy: number) => ({
    x: (sx - pan.x) / zoom,
    y: (sy - pan.y) / zoom,
  });

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const raw = e.dataTransfer.getData("application/nodeflow");
    if (!raw) return;

    const item = JSON.parse(raw);

    const rect = wrapRef.current!.getBoundingClientRect();

    const { x, y } = toWorld(e.clientX - rect.left, e.clientY - rect.top);

    setGraphState({
      nodes: [
        ...nodes,
        {
          id: makeId(),
          type: item.type,
          x: x - 90,
          y: y - 35,
          controlValues: getControlValues(item.type),
          inlineValues: {},
        },
      ],
    });
  };

  const edgePoints = (edge: any) => {
    const sp = anchorCenter(edge.src, "out", edge.srcPort, anchorRefs, wrapRef);
    const tp = anchorCenter(edge.tgt, "in", edge.tgtPort, anchorRefs, wrapRef);
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
      className={`h-full relative overflow-hidden bg-background bg-[radial-gradient(circle,hsl(var(--dot-color))_1px,transparent_1px)] bg-size-[20px_20px] ${connecting ? "cursor-crosshair" : "cursor-default"}`}
      onMouseDown={onCanvasDown}
      onWheel={onWheel}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <svg
        id="edges-svg"
        className="absolute inset-0 overflow-visible pointer-events-none z-0 w-full h-full"
      >
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
        {getGraphState().nodes.map((node) => (
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
              readOnly={readOnly}
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
