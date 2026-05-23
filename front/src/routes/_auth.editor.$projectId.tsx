import { Canvas } from "@/components/canvas/Canvas";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/editor/$projectId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <Topbar>
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
            ↩
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
            ↪
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
            ⊞ Save
          </Button>

          <Button
            size="sm"
            className="ml-auto h-7 px-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            ▶ Run
          </Button>

          <Separator orientation="vertical" className="h-6" />
        </Topbar>

        <div className="flex flex-1">
          <LeftSidebar />
          <div className="flex flex-1 overflow-hidden">
            <Canvas />
            <RightPanel />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
