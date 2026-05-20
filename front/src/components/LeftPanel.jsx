import { useState } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipProvider } from "./ui/tooltip";
import { Badge } from "./ui/badge";
import { NODE_CATALOG } from "../nodes";
import { cn } from "../lib/utils";

function NodeCard({ item, colorVar }) {
  const onDragStart = (e) => {
    e.dataTransfer.setData("application/reactflow-node", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <Tooltip content={item.desc}>
      <div
        draggable
        onDragStart={onDragStart}
        className={cn(
          "group flex items-center gap-2.5 rounded-md px-2.5 py-2",
          "border border-transparent bg-muted/60",
          "hover:bg-card hover:border-border hover:shadow-sm",
          "cursor-grab active:cursor-grabbing select-none transition-all duration-150",
        )}
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-sm font-mono font-medium text-white"
          style={{ background: colorVar }}
        >
          {item.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-sm font-medium leading-none">
              {item.label}
            </span>
            {item.outputs.length > 0 && (
              <Badge variant="outline">{item.outputs.length} out</Badge>
            )}
          </div>
          {item.inputs.length > 0 && (
            <p className="mt-0.5 text-[11px] text-muted-foreground font-mono truncate">
              ({item.inputs.join(", ")})
            </p>
          )}
        </div>
      </div>
    </Tooltip>
  );
}

function CategorySection({ category, colorVar, items, query }) {
  const [open, setOpen] = useState(true);
  const filtered = items.filter(
    (i) =>
      !query ||
      i.label.toLowerCase().includes(query) ||
      i.desc.toLowerCase().includes(query),
  );
  if (filtered.length === 0) return null;

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 px-2 py-1.5 rounded hover:bg-muted transition-colors"
      >
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ background: colorVar }}
        />
        <span className="flex-1 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {category}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {filtered.length}
        </span>
        {open ? (
          <ChevronDown size={13} className="text-muted-foreground" />
        ) : (
          <ChevronRight size={13} className="text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="mt-0.5 mb-2 flex flex-col gap-1 px-1">
          {filtered.map((item) => (
            <NodeCard key={item.type} item={item} colorVar={colorVar} />
          ))}
        </div>
      )}
    </div>
  );
}

export function LeftPanel() {
  const [query, setQuery] = useState("");
  const q = query.toLowerCase().trim();

  return (
    <TooltipProvider>
      <div className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-panel">
        {/* Header */}
        <div className="px-3 pt-3 pb-2">
          <h2 className="text-sm font-semibold tracking-tight mb-2">Nodes</h2>
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nodes…"
              className={cn(
                "w-full rounded-md border border-border bg-muted/50 py-1.5 pl-7 pr-2.5",
                "text-sm placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring",
              )}
            />
          </div>
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-2 py-2">
          {NODE_CATALOG.map((cat) => (
            <CategorySection key={cat.category} query={q} {...cat} />
          ))}
        </ScrollArea>

        <Separator />
        <p className="px-3 py-2 text-[11px] text-muted-foreground">
          Drag a node onto the canvas
        </p>
      </div>
    </TooltipProvider>
  );
}
