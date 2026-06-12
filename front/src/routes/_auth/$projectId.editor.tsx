import { Canvas } from "@/components/canvas/Canvas";
import { LeftSidebar } from "@/components/canvas/LeftSidebar";
import { PuzzleRightPanel } from "@/components/canvas/PuzzleRightPanel";
import { RightPanel } from "@/components/canvas/RightPanel";
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
import {
  requestCompile,
  saveGraphSnapshot,
} from "@/components/state/graphState";
import { Download, Loader2, Play, Save } from "lucide-react";
import { useProjectLoader } from "@/hooks/useProjectLoader";
import { useSaveProject } from "@/hooks/useSaveProject";
import { useShaderLoader } from "@/hooks/useShaderLoader";
import { useSaveShader } from "@/hooks/useSaveShader";

interface EditorSearch {
  puzzleId?: string;
}

export const Route = createFileRoute("/_auth/$projectId/editor")({
  validateSearch: (search: Record<string, unknown>): EditorSearch => ({
    puzzleId: typeof search.puzzleId === "string" ? search.puzzleId : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  const { puzzleId } = Route.useSearch();

  if (puzzleId) {
    return <PuzzleEditor shaderId={projectId} puzzleId={puzzleId} />;
  }

  return <ProjectEditor projectId={projectId} />;
}

function ProjectEditor({ projectId }: { projectId: string }) {
  const { isLoading } = useProjectLoader(projectId);
  const { save, isSaving } = useSaveProject(projectId);

  return (
    <div className="h-svh flex flex-col overflow-hidden">
      <Topbar>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => save()}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => saveGraphSnapshot("shader")}
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
            <ResizablePanel defaultSize={75} minSize={40}>
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Canvas readOnly={false} />
              )}
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <RightPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

function PuzzleEditor({
  shaderId,
  puzzleId,
}: {
  shaderId: string;
  puzzleId: string;
}) {
  const { isLoading } = useShaderLoader(shaderId);
  const { save, isSaving } = useSaveShader(shaderId);

  return (
    <div className="h-svh flex flex-col overflow-hidden">
      <Topbar>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => save()}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Save
        </Button>
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
            <ResizablePanel defaultSize={75} minSize={40}>
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Canvas readOnly={false} />
              )}
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <PuzzleRightPanel
                puzzleId={puzzleId}
                submissionShaderId={shaderId}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}