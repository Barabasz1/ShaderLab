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
import { requestCompile, saveGraphSnapshot } from "@/components/state/graphState";
import { useShaderLoader } from "@/hooks/useShaderLoader";
import { useSaveShader } from "@/hooks/useSaveShader";
import { Play, Download, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/authFetch";

interface PuzzleSearch {
  shaderId?: string;
}

interface SubmissionShaderResponse {
  shaderId: string;
}

export const Route = createFileRoute("/_auth/puzzles/$puzzleId")({
  validateSearch: (search: Record<string, unknown>): PuzzleSearch => ({
    shaderId: typeof search.shaderId === "string" ? search.shaderId : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { puzzleId } = Route.useParams();
  const { shaderId } = Route.useSearch();
  const [submissionShaderId, setSubmissionShaderId] = useState<string | undefined>(shaderId);
  const [isLoadingShaderId, setIsLoadingShaderId] = useState(!shaderId);

  useEffect(() => {
    if (shaderId) {
      setSubmissionShaderId(shaderId);
      setIsLoadingShaderId(false);
      return;
    }

    let cancelled = false;
    setIsLoadingShaderId(true);

    authFetch(`/api/puzzles/${puzzleId}/submission-shader`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load your puzzle submission shader");
        return res.json();
      })
      .then((data: SubmissionShaderResponse) => {
        if (!cancelled) setSubmissionShaderId(data.shaderId);
      })
      .catch((err) => {
        if (!cancelled) {
          setSubmissionShaderId(undefined);
          console.error(err);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingShaderId(false);
      });

    return () => {
      cancelled = true;
    };
  }, [puzzleId, shaderId]);

  const { isLoading } = useShaderLoader(submissionShaderId);
  const { save, isSaving } = useSaveShader(submissionShaderId);

  return (
    <div className="h-svh flex flex-col overflow-hidden">
      <Topbar>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => save()}
          disabled={isSaving || !submissionShaderId}
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
        {isLoadingShaderId && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
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
              {isLoading || isLoadingShaderId ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Canvas readOnly={false} />
              )}
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={"25%"} minSize={"20%"} maxSize={"40%"}>
              <PuzzleRightPanel
                puzzleId={puzzleId}
                submissionShaderId={submissionShaderId}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}