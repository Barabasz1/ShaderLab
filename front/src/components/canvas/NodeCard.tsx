import { useEffect, useState } from "react";
import { nodeDefs, PortTypeColors } from "@/nodes/nodeDefs";
import type { PortDef } from "@/nodes/nodeDefs";
import type { ControlValue } from "@/components/state/graphState";

interface NodeCardProps {
  node: any;
  selected: boolean;
  onNodeDown: (e: React.MouseEvent, id: string) => void;
  onHeaderDown: (e: React.MouseEvent, id: string) => void;
  onAnchorDown: (
    e: React.MouseEvent,
    nodeId: string,
    port: string,
    side: string,
  ) => void;
  onAnchorUp: (
    e: React.MouseEvent,
    nodeId: string,
    port: string,
    side: string,
  ) => void;
  onControlChange: (
    nodeId: string,
    controlId: string,
    value: ControlValue,
  ) => void;
  onInlineValueChange: (
    nodeId: string,
    inputId: string,
    value: ControlValue,
  ) => void;
  anchorRefs: React.MutableRefObject<Record<string, HTMLDivElement>>;
  connectedPorts?: Set<string>;
  readOnly: boolean;
}

const inlineParts: Record<string, string[]> = {
  vec2: ["x", "y"],
  vec3: ["x", "y", "z"],
  vec4: ["x", "y", "z", "w"],
};

const inlineKey = (port: PortDef, part?: string) =>
  part ? `${port.id}.${part}` : port.id;

function InlineInputPopup({
  node,
  port,
  onInlineValueChange,
}: {
  node: any;
  port: PortDef;
  onInlineValueChange: (
    nodeId: string,
    inputId: string,
    value: ControlValue,
  ) => void;
}) {
  const parts = inlineParts[port.type] ?? [];
  const keys = parts.length > 0 ? parts : [undefined];

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 right-[calc(100%+10px)] h-[18px] flex items-center gap-1.5 px-[5px] bg-card border border-border rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.12)] z-40"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {keys.map((part) => {
        const key = inlineKey(port, part);
        const label = part ? part.toUpperCase() : port.label;
        const fallback = part === "w" ? 1 : 0;
        const value = node.inlineValues?.[key] ?? fallback;
        return (
          <label
            key={key}
            className="h-[14px] flex items-center gap-[3px] text-[9px] font-mono text-muted-foreground whitespace-nowrap"
          >
            <span>{label}</span>
            <input
              type="text"
              inputMode="decimal"
              value={value}
              step={0.01}
              onChange={(e) =>
                onInlineValueChange(node.id, key, e.target.value)
              }
              onBlur={(e) => {
                if (e.target.value === "")
                  onInlineValueChange(node.id, key, fallback);
              }}
              className="w-[42px] h-[14px] border border-border rounded-full px-[5px] text-[9px] leading-[14px] bg-muted text-foreground outline-none focus:border-primary"
            />
          </label>
        );
      })}
    </div>
  );
}

export function NodeCard({
  node,
  selected,
  onNodeDown,
  onHeaderDown,
  onAnchorDown,
  onAnchorUp,
  onControlChange,
  onInlineValueChange,
  anchorRefs,
  connectedPorts,
  readOnly,
}: NodeCardProps) {
  const def = nodeDefs[node.type];
  const [openInputs, setOpenInputs] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setOpenInputs((current) => {
      const next = new Set(current);

      for (const inputId of current) {
        if (connectedPorts?.has(`in:${inputId}`)) {
          next.delete(inputId);
        }
      }

      return next;
    });
  }, [connectedPorts]);

  if (!def) return null;

  const category =
    def.category ??
    ({
      label: "Graph",
      color: "hsl(215,20%,45%)",
      bg: "hsl(215,20%,94%)",
    } as const);

  const nodeWidth = Math.max(
    180,
    48 +
      def.label.length * 7 +
      (def.category ? category.label.length * 6 + 28 : 0),
  );

  return (
    <div
      className={`node${selected ? " selected z-100" : ""}`}
      style={{ left: node.x, top: node.y, width: nodeWidth }}
      onMouseDown={(e) => onNodeDown(e, node.id)}
    >
      <div
        className="node-header"
        style={{ background: category.bg }}
        onMouseDown={(e) => onHeaderDown(e, node.id)}
      >
        <span className="node-title">{def.label}</span>

        {def.category && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
            style={{
              background: category.color,
              color: "white",
            }}
          >
            {category.label}
          </span>
        )}
      </div>

      <div className="node-body">
        <div className="flex flex-col gap-1">
          {def.inputs.map((p) => {
            const isConnected = connectedPorts?.has(`in:${p.id}`);
            const isOpen = openInputs.has(p.id) && !isConnected;

            return (
              <div key={p.id} className="flex items-center gap-1">
                <div
                  className={`w-3.5 h-3.5 rounded-full border-[2.5px] border-white relative z-10 transition-[transform] duration-200 ${readOnly ? "" : "cursor-crosshair hover:scale-[1.35]"}`}
                  style={{ background: PortTypeColors[p.type] }}
                  ref={(el) => {
                    if (el) anchorRefs.current[`${node.id}:in:${p.id}`] = el;
                  }}
                  onMouseDown={(e) => onAnchorDown(e, node.id, p.id, "in")}
                  onMouseUp={(e) => onAnchorUp(e, node.id, p.id, "in")}
                  onClick={(e) => {
                    e.stopPropagation();

                    if (isConnected) {
                      setOpenInputs((current) => {
                        const next = new Set(current);
                        next.delete(p.id);
                        return next;
                      });
                      return;
                    }

                    setOpenInputs((current) => {
                      const next = new Set(current);

                      if (next.has(p.id)) {
                        next.delete(p.id);
                      } else {
                        next.add(p.id);
                      }

                      return next;
                    });
                  }}
                />

                <span className="text-[10px] font-mono text-muted-foreground leading-none">
                  {p.label}
                </span>

                {isOpen && (
                  <InlineInputPopup
                    node={node}
                    port={p}
                    onInlineValueChange={onInlineValueChange}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-1 items-end">
          {def.outputs.map((p) => (
            <div key={p.id} className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-muted-foreground leading-none">
                {p.label}
              </span>

              <div
                className={`w-3.5 h-3.5 rounded-full border-[2.5px] border-white relative z-10 transition-[transform] duration-200 ${readOnly ? "" : "cursor-crosshair hover:scale-[1.35]"}`}
                style={{ background: PortTypeColors[p.type] }}
                ref={(el) => {
                  if (el) anchorRefs.current[`${node.id}:out:${p.id}`] = el;
                }}
                onMouseDown={(e) => onAnchorDown(e, node.id, p.id, "out")}
                onMouseUp={(e) => onAnchorUp(e, node.id, p.id, "out")}
              />
            </div>
          ))}
        </div>
      </div>

      {def.controls.length > 0 && (
        <div className="px-3 pb-3 flex flex-col gap-2">
          {def.controls.map((control) => {
            const rawValue =
              node.controlValues?.[control.id] ?? control.default;
            const enabled =
              rawValue === true || rawValue === 1 || rawValue === "1";
            const inputValue =
              typeof rawValue === "boolean" ? (rawValue ? 1 : 0) : rawValue;

            return (
              <label
                key={control.id}
                className="flex items-center justify-between gap-3 text-[10px] font-mono text-muted-foreground"
              >
                <span className="shrink-0">{control.label}</span>
                {control.type === "bool" ? (
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() =>
                      onControlChange(node.id, control.id, !enabled)
                    }
                    className={`h-5 w-9 rounded-full border transition-colors p-0.5 flex items-center shrink-0 ${
                      enabled
                        ? "bg-blue-600 border-blue-600 justify-end"
                        : "bg-white border-input justify-start"
                    }`}
                    aria-pressed={enabled}
                  >
                    <span
                      className={`h-4 w-4 rounded-full shadow-sm block ${
                        enabled ? "bg-white" : "bg-slate-400"
                      }`}
                    />
                  </button>
                ) : (
                  <input
                    type="text"
                    inputMode="decimal"
                    value={inputValue}
                    min={control.min}
                    max={control.max}
                    step={0.01}
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      onControlChange(node.id, control.id, e.target.value)
                    }
                    onBlur={(e) => {
                      if (e.target.value === "")
                        onControlChange(node.id, control.id, 0);
                    }}
                    className="border border-border rounded-full px-[5px] text-[9px] leading-[14px] bg-muted text-foreground outline-none focus:border-primary"
                  />
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
