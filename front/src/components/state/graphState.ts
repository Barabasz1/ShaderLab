import { useSyncExternalStore } from "react";

export type ControlValue = number | string | boolean;

export interface UiNode {
  id: string;
  type: string;
  x: number;
  y: number;
  controlValues?: Record<string, ControlValue>;
  inlineValues?: Record<string, ControlValue>;
}

export interface UiEdge {
  id: string;
  src: string;
  srcPort: string;
  tgt: string;
  tgtPort: string;
}

interface GraphState {
  nodes: UiNode[];
  edges: UiEdge[];
  glslCode: string;
  compileError: string | null;
  runtimeError: string | null;
  compileRequest: number;
}

let state: GraphState = {
  nodes: [],
  edges: [],
  glslCode: "",
  compileError: null,
  runtimeError: null,
  compileRequest: 0,
};

const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export const getGraphState = () => state;

export const subscribeGraphState = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setGraphState = (patch: Partial<GraphState>) => {
  state = { ...state, ...patch };
  emit();
};

export const requestCompile = () => {
  state = { ...state, compileRequest: state.compileRequest + 1 };
  emit();
};

const safeFileName = (name: string) =>
  name.trim().replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "shader";

const downloadFile = (name: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

export const saveGraphSnapshot = (name = "shader") => {
  const snapshot = {
    version: 1,
    savedAt: new Date().toISOString(),
    nodes: state.nodes,
    edges: state.edges,
    glslCode: state.glslCode,
  };

  downloadFile(
    `${safeFileName(name)}.json`,
    JSON.stringify(snapshot, null, 2),
    "application/json",
  );
};

export const saveGlslCode = (name = "shader") => {
  downloadFile(`${safeFileName(name)}.glsl`, state.glslCode, "text/plain");
};

export const useGraphState = () =>
  useSyncExternalStore(subscribeGraphState, getGraphState, getGraphState);
