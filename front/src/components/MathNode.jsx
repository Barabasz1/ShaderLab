import { Handle, Position } from "reactflow";
import { cn } from "../lib/utils";
import { NODE_CATALOG } from "../nodes";

const CATALOG_MAP = {};
NODE_CATALOG.forEach(({ colorVar, items }) => {
  items.forEach((item) => {
    CATALOG_MAP[item.type] = { ...item, colorVar };
  });
});

export function MathNode({ data, selected }) {
  const meta = CATALOG_MAP[data.type] ?? {
    label: data.type,
    inputs: [],
    outputs: [],
    icon: "?",
    colorVar: "var(--cat-util)",
  };

  return (
    <div
      className={cn(
        "min-w-[140px] rounded-lg border bg-card shadow-sm transition-shadow",
        selected
          ? "border-brand-500 shadow-md ring-1 ring-brand-500/30"
          : "border-border",
      )}
    >
      {/* Node header */}
      <div
        className="flex items-center gap-2 rounded-t-lg px-3 py-2"
        style={{
          background: meta.colorVar + "22",
          borderBottom: `1px solid ${meta.colorVar}44`,
        }}
      >
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-mono text-white"
          style={{ background: meta.colorVar }}
        >
          {meta.icon}
        </span>
        <span className="text-xs font-semibold leading-none">{meta.label}</span>
      </div>

      {/* Ports */}
      <div className="relative flex gap-8 px-3 py-2.5">
        {/* Inputs column */}
        <div className="flex flex-col gap-2">
          {meta.inputs.map((port, i) => (
            <div key={port + i} className="relative flex items-center gap-1.5">
              <Handle
                type="target"
                position={Position.Left}
                id={`in-${port}`}
                style={{
                  background: meta.colorVar,
                  top: "auto",
                  position: "relative",
                  left: 0,
                  transform: "none",
                }}
                className="!relative !top-auto !left-auto !transform-none !w-2.5 !h-2.5"
              />
              <span className="text-[10px] text-muted-foreground font-mono">
                {port}
              </span>
            </div>
          ))}
        </div>

        {/* Outputs column */}
        <div className="ml-auto flex flex-col items-end gap-2">
          {meta.outputs.map((port, i) => (
            <div key={port + i} className="relative flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground font-mono">
                {port}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id={`out-${port}`}
                style={{ background: meta.colorVar }}
                className="!relative !top-auto !right-auto !transform-none !w-2.5 !h-2.5"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const nodeTypes = {
  mathNode: MathNode,
};
