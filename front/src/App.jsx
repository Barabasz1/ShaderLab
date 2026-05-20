import "./styles.css";
import { Topbar } from "./components/Topbar";
import { LeftPanel } from "./components/LeftPanel";
import { Canvas } from "./components/Canvas";
import { RightPanel } from "./components/RightPanel";

export default function App() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel />
        <Canvas />
        <RightPanel />
      </div>
    </div>
  );
}
