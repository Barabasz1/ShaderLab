import { SidebarProvider } from "@/components/ui/sidebar";
import { Topbar } from "./components/layout/Topbar";
import { LeftSidebar } from "./components/layout/LeftSidebar";
import { RightPanel } from "./components/layout/RightPanel";
import { Canvas } from "./components/canvas/Canvas";

export default function App() {
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
