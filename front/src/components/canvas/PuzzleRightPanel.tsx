import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Copy, Download, Loader2, MonitorPlay, TerminalSquare } from "lucide-react";
import ShaderCanvas, {
  type ShaderCanvasHandle,
} from "@/components/canvas/ShaderCanvas";
import { evaluateGraph } from "@/graph/evaluator";
import { translateToGLSL } from "@/glsl/translator";
import { nodeDefs } from "@/nodes/nodeDefs";
import {
  saveGlslCode,
  setGraphState,
  useGraphState,
  type ControlValue,
  type UiEdge,
  type UiNode,
} from "@/components/state/graphState";
import { authFetch } from "@/lib/authFetch";
import { compareShadersDynamic } from "@/webgl/shaderComparator";

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

interface PuzzleDetails {
  id: string;
  name: string | null;
  description: string | null;
  passingRating: number;
  solutionShader: {
    code: string;
  };
}

interface PuzzleRightPanelProps {
  puzzleId: string;
}

const puzzleVertexSrc = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

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

export function PuzzleRightPanel({ puzzleId }: PuzzleRightPanelProps) {
  const canvasRef = useRef<ShaderCanvasHandle>(null);
  const puzzleCanvasRef = useRef<ShaderCanvasHandle>(null);
  const graph = useGraphState();
  const [puzzle, setPuzzle] = useState<PuzzleDetails | null>(null);
  const [isLoadingPuzzle, setIsLoadingPuzzle] = useState(true);
  const [puzzleError, setPuzzleError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passedOpen, setPassedOpen] = useState(false);

  useEffect(() => {
    setIsLoadingPuzzle(true);
    setPuzzleError(null);

    authFetch(`/api/puzzles/${puzzleId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load puzzle");
        return res.json();
      })
      .then((data) => setPuzzle(data))
      .catch((err) => setPuzzleError(err.message))
      .finally(() => setIsLoadingPuzzle(false));
  }, [puzzleId]);

  useEffect(() => {
    if (!puzzle?.solutionShader?.code) return;
    puzzleCanvasRef.current?.compile(puzzleVertexSrc, puzzle.solutionShader.code);
  }, [puzzle]);

  useEffect(() => {
    if (!graph.compileRequest) return;

    setGraphState({ compileError: null, runtimeError: null });
    setRating(null);

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

    if (result?.error) return;
    if (!puzzle?.solutionShader?.code) return;

    setIsSubmitting(true);

    try {
      const comparison = compareShadersDynamic(
        puzzle.solutionShader.code,
        fragmentSrc,
      );

      authFetch(`/api/puzzles/${puzzleId}/submissions/v2`, {
        method: "POST",
        body: JSON.stringify({
          graph: { nodes: graph.nodes, edges: graph.edges },
          code: fragmentSrc,
          rating: comparison.rating,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to submit puzzle solution");
          return res.json();
        })
        .then((data) => {
          const newRating = data.rating ?? comparison.rating;

          setRating(newRating);
          if (puzzle && newRating >= puzzle.passingRating) setPassedOpen(true);
        })
        .catch((err) => setGraphState({ runtimeError: err.message }))
        .finally(() => setIsSubmitting(false));
    } catch (err) {
      setGraphState({
        runtimeError: err instanceof Error ? err.message : "Failed to compare shaders",
      });
      setIsSubmitting(false);
    }
  }, [graph.compileRequest]);

  const error = graph.compileError ?? graph.runtimeError ?? puzzleError;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="h-11 px-3 flex items-center justify-between shrink-0 bg-background z-10">
        <span className="text-[13px] font-semibold flex items-center gap-2">
          <MonitorPlay className="w-4 h-4 text-brand" />
          Puzzle Output
        </span>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      <Separator />
      <div className="flex flex-col h-full overflow-hidden">
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 flex flex-col gap-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Your Preview
            </div>
            <div className="w-full aspect-square rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden">
              <ShaderCanvas ref={canvasRef} />
              {!graph.glslCode && (
                <div className="absolute inset-0 bg-linear-to-br from-purple-500 via-red-500 to-yellow-500 opacity-80 mix-blend-screen transition-transform" />
              )}
            </div>

            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Puzzle Preview
            </div>
            <div className="w-full aspect-square rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden">
              <ShaderCanvas ref={puzzleCanvasRef} />
              {isLoadingPuzzle && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            {rating !== null && (
              <div className="rounded-md border bg-muted/30 p-3 flex items-center justify-between">
                <span className="text-sm font-medium">Rating</span>
                <Badge variant="outline">{Math.round(rating * 100)}%</Badge>
              </div>
            )}

            {error && (
              <pre className="text-red-600 whitespace-pre-wrap rounded-md border border-red-600 bg-muted/30 p-2 text-[11px] font-mono">
                {error}
              </pre>
            )}
          </div>

          <Separator />

          <div className="p-4 flex flex-col gap-3 min-h-80">
            <div className="flex items-center justify-between shrink-0">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <TerminalSquare className="w-4 h-4" />
                Generated GLSL
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-brand hover:text-brand-dark"
                  onClick={() => saveGlslCode(`puzzle-${puzzleId}`)}
                  disabled={!graph.glslCode}
                >
                  <Download className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-brand hover:text-brand-dark"
                  onClick={() => navigator.clipboard?.writeText(graph.glslCode)}
                  disabled={!graph.glslCode}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
            <ScrollArea className="h-80 rounded-md bg-muted/30 border shadow-inner">
              <div className="p-4 min-w-max">
                <pre className="text-[11px] text-[#c9d1d9] font-mono leading-relaxed">
                  {graph.glslCode || "Run to see generated GLSL"}
                </pre>
              </div>
              <ScrollBar orientation="horizontal" />
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </ScrollArea>
      </div>

      <AlertDialog open={passedOpen} onOpenChange={setPassedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Puzzle passed</AlertDialogTitle>
            <AlertDialogDescription>
              Your shader reached {rating === null ? "the required" : `${Math.round(rating * 100)}%`} rating.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
