import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Copy, MonitorPlay, TerminalSquare } from "lucide-react";

export function RightPanel() {
  const [w, setW] = useState(320);
  const start = useRef<{ x: number; w: number } | null>(null);

  const onHandleDown = (e: React.MouseEvent) => {
    start.current = { x: e.clientX, w };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const move = (ev: MouseEvent) => {
      if (start.current) {
        setW(
          Math.min(
            600,
            Math.max(240, start.current.w + start.current.x - ev.clientX),
          ),
        );
      }
    };

    const up = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div
      id="right-panel-wrap"
      style={{ width: w }}
      className="flex h-full shrink-0 relative bg-background"
    >
      {/* Resizer Handle */}
      <div
        id="rp-handle"
        onMouseDown={onHandleDown}
        className="w-1 cursor-col-resize bg-border hover:bg-blue-500 transition-colors shrink-0 z-20"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-11 px-3 flex items-center justify-between shrink-0 bg-background z-10">
          <span className="text-[13px] font-semibold flex items-center gap-2">
            <MonitorPlay className="w-4 h-4 text-blue-600" />
            Shader Output
          </span>
          <Badge
            variant="secondary"
            className="text-[10px] font-mono px-1.5 h-5"
          >
            {w}px
          </Badge>
        </div>

        <Separator />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Visual Preview Section */}
          <div className="p-4 flex flex-col gap-3 shrink-0">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              Preview
            </div>

            {/* WebGL Canvas Placeholder */}
            <div className="w-full aspect-square bg-slate-950 rounded-lg shadow-inner border border-slate-800 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-red-500 to-yellow-500 opacity-80 mix-blend-screen transition-transform duration-1000 group-hover:scale-110" />
              <Badge
                variant="outline"
                className="z-10 bg-black/60 text-white/80 border-white/20 font-mono tracking-widest backdrop-blur-sm"
              >
                WebGL Canvas
              </Badge>
            </div>
          </div>

          <Separator />

          {/* GLSL Code Section */}
          <div className="p-4 flex-1 flex flex-col gap-3 bg-muted/30 min-h-[300px]">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <TerminalSquare className="w-4 h-4" />
                Generated GLSL
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>

            {/* Code Block */}
            <ScrollArea className="flex-1 rounded-md bg-[#0d1117] border shadow-inner">
              <div className="p-4 min-w-max">
                <pre className="text-[11px] text-[#c9d1d9] font-mono leading-relaxed">
                  {`// Auto-generated from NodeFlow
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;

void main() {
    // Normalize pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    
    // Time varying pixel color
    vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0,2,4));

    // Output to screen
    gl_FragColor = vec4(col, 1.0);
}`}
                </pre>
              </div>
              <ScrollBar orientation="horizontal" />
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
