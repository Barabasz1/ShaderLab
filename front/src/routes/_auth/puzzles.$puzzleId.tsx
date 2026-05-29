import { Canvas } from "@/components/canvas/Canvas";
import { LeftSidebar } from "@/components/canvas/LeftSidebar";
import { PuzzleRightPanel } from "@/components/canvas/PuzzleRightPanel";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createFileRoute } from "@tanstack/react-router";
import { requestCompile, setGraphState, saveGraphSnapshot } from "@/components/state/graphState";
import { Play, Download } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/_auth/puzzles/$puzzleId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { puzzleId } = Route.useParams();

  useEffect(() => {
    setGraphState({
      nodes: [],
      edges: [],
      glslCode: "",
      compileError: null,
      runtimeError: null,
    });
  }, [puzzleId]);

  return (
    <div className="h-svh flex flex-col overflow-hidden">
      <Topbar>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => saveGraphSnapshot(`puzzle-${puzzleId}`)}
        >
          <Download className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          className="ml-auto h-7 px-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={requestCompile}
        >
          <Play className="w-3.5 h-3.5" />
          Run
        </Button>
        <Separator orientation="vertical" className="h-6" />
      </Topbar>

      <SidebarProvider className="min-h-0 w-full h-[calc(100svh-2.75rem)]!">
        <LeftSidebar />
        <SidebarInset className="flex flex-col min-h-0 overflow-hidden">
          <ResizablePanelGroup
            orientation="horizontal"
            className="flex-1 min-h-0"
          >
            <ResizablePanel defaultSize={"75%"} minSize={"40%"}>
              <Canvas readOnly={false} />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={"25%"} minSize={"20%"} maxSize={"40%"}>
              <PuzzleRightPanel puzzleId={puzzleId} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
