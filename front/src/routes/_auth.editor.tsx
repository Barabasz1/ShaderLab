import { Canvas } from "@/components/canvas/Canvas";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { Topbar } from "@/components/layout/Topbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/editor")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <LeftSidebar />
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <Topbar />
        <div className="flex flex-1 overflow-hidden">
          <Canvas />
          <RightPanel />
        </div>
      </div>
    </SidebarProvider>
  );
}
