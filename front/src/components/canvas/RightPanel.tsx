import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Copy, MonitorPlay, TerminalSquare } from "lucide-react";
import ShaderCanvas, {
  type ShaderCanvasHandle,
} from "@/components/canvas/ShaderCanvas";
import { evaluateGraph } from "@/graph/evaluator";
import { translateToGLSL } from "@/glsl/translator";
import { nodeDefs } from "@/nodes/nodeDefs";
import {
  setGraphState,
  useGraphState,
  type ControlValue,
  type UiEdge,
  type UiNode,
} from "@/components/state/graphState";

interface CompilerNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    nodeType: string;
    controlValues: Record<string, number>;
    inlineValues: Record<string, ControlValue>;
  };
}

interface CompilerEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

const toNumberValue = (value: ControlValue | undefined, fallback: number) => {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number")
    return Number.isFinite(value) ? value : fallback;
  if (value === "" || value === "-" || value === "." || value === "-.")
    return 0;
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toCompilerNodes = (nodes: UiNode[]): CompilerNode[] =>
  nodes.map((node) => {
    const def = nodeDefs[node.type];
    const controlValues: Record<string, number> = {};

    def?.controls.forEach((control) => {
      const value = node.controlValues?.[control.id];
      controlValues[control.id] =
        control.type === "bool"
          ? toNumberValue(value, control.default)
            ? 1
            : 0
          : toNumberValue(value, control.default);
    });

    Object.entries(node.controlValues ?? {}).forEach(([key, value]) => {
      if (!(key in controlValues)) controlValues[key] = toNumberValue(value, 0);
    });

    return {
      id: node.id,
      type: "shaderNode",
      position: { x: node.x, y: node.y },
      data: {
        nodeType: node.type,
        controlValues,
        inlineValues: { ...(node.inlineValues ?? {}) },
      },
    };
  });

const toCompilerEdges = (edges: UiEdge[]): CompilerEdge[] =>
  edges.map((edge) => ({
    id: edge.id,
    source: edge.src,
    sourceHandle: edge.srcPort,
    target: edge.tgt,
    targetHandle: edge.tgtPort,
  }));

export function RightPanel() {
  const canvasRef = useRef<ShaderCanvasHandle>(null);
  const graph = useGraphState();

  useEffect(() => {
    if (!graph.compileRequest) return;

    setGraphState({ compileError: null, runtimeError: null });

    const {
      evalNodes,
      outputVarName,
      error: evalError,
    } = evaluateGraph(
      toCompilerNodes(graph.nodes),
      toCompilerEdges(graph.edges),
      nodeDefs,
    );

    if (evalError) {
      setGraphState({ compileError: evalError });
      return;
    }

    const {
      fragmentSrc,
      vertexSrc,
      error: glslError,
    } = translateToGLSL(evalNodes, outputVarName, nodeDefs);

    if (glslError) {
      setGraphState({ compileError: glslError });
      return;
    }

    const result = canvasRef.current?.compile(vertexSrc, fragmentSrc);

    setGraphState({
      glslCode: fragmentSrc,
      runtimeError: result?.error ?? null,
    });
  }, [graph.compileRequest]);

  const error = graph.compileError ?? graph.runtimeError;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="h-11 px-3 flex items-center justify-between shrink-0 bg-background z-10">
        <span className="text-[13px] font-semibold flex items-center gap-2">
          <MonitorPlay className="w-4 h-4 text-brand" />
          Shader Output
        </span>
      </div>
      <Separator />
      <div className="flex flex-col h-full overflow-hidden">
        <div className="p-4 flex flex-col gap-3 shrink-0">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Preview
          </div>
          <div className="w-full aspect-square rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden">
            <ShaderCanvas ref={canvasRef} />
            {!graph.glslCode && (
              <div className="absolute inset-0 bg-linear-to-br from-purple-500 via-red-500 to-yellow-500 opacity-80 mix-blend-screen transition-transform" />
            )}
          </div>
          {error && (
            <pre className="text-red-600 whitespace-pre-wrap rounded-md border border-red-600 bg-muted/30 p-2 text-[11px] font-mono">
              {error}
            </pre>
          )}
        </div>
        <Separator />
        <div className="p-4 flex-1 min-h-0 flex flex-col gap-3">
          <div className="flex items-center justify-between shrink-0">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <TerminalSquare className="w-4 h-4" />
              Generated GLSL
            </div>
            <Button
              variant="ghost"
              size="sm"
              className=" text-brand hover:text-brand-dark"
              onClick={() => navigator.clipboard?.writeText(graph.glslCode)}
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
          </div>
          <ScrollArea className="flex-1 min-h-0 rounded-md bg-muted/30 border shadow-inner">
            <div className="p-4 min-w-max">
              <pre className="text-[11px] text-[#c9d1d9] font-mono leading-relaxed">
                {graph.glslCode || "Run to see generated GLSL"}
              </pre>
            </div>
            <ScrollBar orientation="horizontal" />
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
