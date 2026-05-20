import { useRef, useState, useCallback } from "react";
import { Separator } from "./ui/separator";
import { cn } from "../lib/utils";

const MIN_W = 180;
const MAX_W = 520;
const DEFAULT_W = 260;

export function RightPanel() {
  const [width, setWidth] = useState(DEFAULT_W);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const onMouseDown = useCallback(
    (e) => {
      dragging.current = true;
      startX.current = e.clientX;
      startW.current = width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onMove = (e) => {
        if (!dragging.current) return;
        const delta = startX.current - e.clientX;
        setWidth(Math.min(MAX_W, Math.max(MIN_W, startW.current + delta)));
      };
      const onUp = () => {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [width],
  );

  return (
    <div className="flex h-full shrink-0" style={{ width }}>
      {/* Drag handle */}
      <div
        onMouseDown={onMouseDown}
        className={cn(
          "w-1 cursor-col-resize shrink-0 bg-border",
          "hover:bg-brand-500 transition-colors duration-150",
          "active:bg-brand-600",
        )}
      />

      <div className="flex flex-1 flex-col border-l border-border bg-panel overflow-hidden">
        <div className="px-3 pt-3 pb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Inspector</h2>
          <span className="text-[10px] font-mono text-muted-foreground">
            {width}px
          </span>
        </div>
        <Separator />

        {/* Empty state */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center px-4">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg">
            ✦
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Nothing selected
          </p>
          <p className="text-xs text-muted-foreground/60">
            Click a node to inspect its properties
          </p>
        </div>
      </div>
    </div>
  );
}
