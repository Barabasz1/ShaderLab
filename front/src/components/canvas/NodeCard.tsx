import { META, CAT } from "@/lib/constants";
import { CategoryBadge } from "../ui/CategoryBadge";

interface NodeCardProps {
  node: any;
  selected: boolean;
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
  anchorRefs: React.MutableRefObject<Record<string, HTMLDivElement>>;
  connectedPorts?: Set<string>;
}

export function NodeCard({
  node,
  selected,
  onHeaderDown,
  onAnchorDown,
  onAnchorUp,
  anchorRefs,
  connectedPorts,
}: NodeCardProps) {
  const meta = META[node.type] ?? {
    label: node.type,
    icon: "?",
    inputs: [],
    outputs: [],
    cat: "Utility",
  };
  const cat = CAT[meta.cat] ?? CAT.Utility;

  return (
    <div
      className={`node${selected ? " selected" : ""}`}
      style={{ left: node.x, top: node.y }}
    >
      <div
        className="node-header"
        style={{ background: cat.bg }}
        onMouseDown={(e) => onHeaderDown(e, node.id)}
      >
        <span className="node-icon" style={{ background: cat.color }}>
          {meta.icon}
        </span>
        <span className="node-title">{meta.label}</span>
        <CategoryBadge category={meta.cat}>{meta.cat}</CategoryBadge>
      </div>

      <div className="node-body">
        <div className="ports-col">
          {meta.inputs.map((p: string) => (
            <div key={p} className="port-row">
              <div
                className={`anchor${connectedPorts?.has(`in:${p}`) ? " connected" : ""}`}
                style={{ background: cat.color }}
                ref={(el) => {
                  if (el) anchorRefs.current[`${node.id}:in:${p}`] = el;
                }}
                onMouseDown={(e) => onAnchorDown(e, node.id, p, "in")}
                onMouseUp={(e) => onAnchorUp(e, node.id, p, "in")}
              />
              <span className="port-label">{p}</span>
            </div>
          ))}
        </div>

        <div className="ports-col right">
          {meta.outputs.map((p: string) => (
            <div key={p} className="port-row right">
              <span className="port-label">{p}</span>
              <div
                className={`anchor${connectedPorts?.has(`out:${p}`) ? " connected" : ""}`}
                style={{ background: cat.color }}
                ref={(el) => {
                  if (el) anchorRefs.current[`${node.id}:out:${p}`] = el;
                }}
                onMouseDown={(e) => onAnchorDown(e, node.id, p, "out")}
                onMouseUp={(e) => onAnchorUp(e, node.id, p, "out")}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
