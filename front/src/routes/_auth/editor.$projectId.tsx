import { Canvas, syncUid } from "@/components/canvas/Canvas";
import { LeftSidebar } from "@/components/canvas/LeftSidebar";
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
  setGraphState,
  useGraphState,
} from "@/components/state/graphState";
import { Loader2, Play, Redo2, Save, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import keycloak from "@/lib/keycloak";
import { authFetch } from "@/lib/authFetch";

export const Route = createFileRoute("/_auth/editor/$projectId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  const graph = useGraphState();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const save = async () => {
    if (!keycloak.authenticated) return;
    setIsSaving(true);
    try {
      const res = await authFetch(
        `/api/shaders/project/${projectId}/autosave`,
        {
          method: "PATCH",
          body: JSON.stringify({
            graph: { nodes: graph.nodes, edges: graph.edges },
            code: graph.glslCode,
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to save");
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    authFetch(`/api/shaders/project/${projectId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        const nodes = data.graph?.nodes ?? [];
        const edges = data.graph?.edges ?? [];
        syncUid(nodes, edges);
        setGraphState({ nodes, edges, glslCode: data.code ?? "" });
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [projectId]);

  return (
    <div className="h-svh flex flex-col overflow-hidden">
      <Topbar>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
          <Undo2 className="w-3.5 h-3.5" />
        </Button>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
          <Redo2 className="w-3.5 h-3.5" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
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
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Canvas />
              )}
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={"20%"} minSize={"15%"} maxSize={"30%"}>
              <RightPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
