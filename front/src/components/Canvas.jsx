import { useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { nodeTypes } from "./MathNode";

const INITIAL_NODES = [
  {
    id: "1",
    type: "mathNode",
    position: { x: 120, y: 160 },
    data: { type: "number" },
  },
  {
    id: "2",
    type: "mathNode",
    position: { x: 120, y: 280 },
    data: { type: "number" },
  },
  {
    id: "3",
    type: "mathNode",
    position: { x: 360, y: 210 },
    data: { type: "add" },
  },
  {
    id: "4",
    type: "mathNode",
    position: { x: 580, y: 210 },
    data: { type: "output" },
  },
];
const INITIAL_EDGES = [
  {
    id: "e1-3",
    source: "1",
    sourceHandle: "out-value",
    target: "3",
    targetHandle: "in-a",
    animated: true,
  },
  {
    id: "e2-3",
    source: "2",
    sourceHandle: "out-value",
    target: "3",
    targetHandle: "in-b",
    animated: true,
  },
  {
    id: "e3-4",
    source: "3",
    sourceHandle: "out-result",
    target: "4",
    targetHandle: "in-value",
    animated: true,
  },
];

let idCounter = 10;

export function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/reactflow-node");
      if (!raw) return;
      const item = JSON.parse(raw);

      const bounds = e.currentTarget.getBoundingClientRect();
      const position = {
        x: e.clientX - bounds.left - 70,
        y: e.clientY - bounds.top - 40,
      };

      const newNode = {
        id: String(++idCounter),
        type: "mathNode",
        position,
        data: { type: item.type },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes],
  );

  return (
    <div className="flex-1 h-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        deleteKeyCode="Delete"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(220 13% 82%)"
        />
        <Controls />
        <MiniMap
          nodeColor={(n) => "hsl(var(--brand-500))"}
          maskColor="hsl(var(--canvas) / 0.6)"
        />
      </ReactFlow>
    </div>
  );
}
