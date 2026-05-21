import { Canvas } from "@/components/canvas/Canvas";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { Topbar } from "@/components/layout/Topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/editor")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <Topbar />
        <div className="flex flex-1">
          <LeftSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-xl bg-muted/50" />
                <div className="aspect-video rounded-xl bg-muted/50" />
                <div className="aspect-video rounded-xl bg-muted/50" />
              </div>
              <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
  /*   return (
    <SidebarProvider>
      <LeftSidebar />
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <Topbar />
          <div className="flex flex-1 overflow-hidden">
            <Canvas />
            <RightPanel />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  ); */
}
