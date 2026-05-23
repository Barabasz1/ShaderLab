import { Dashboard } from "@/components/dashboard/Dashboard";
import { Topbar } from "@/components/layout/Topbar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar/>
      <div className="flex flex-1 overflow-hidden">
        <Dashboard />
      </div>
    </div>
  );
}
