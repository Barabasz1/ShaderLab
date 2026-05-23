import { Topbar } from "@/components/layout/Topbar";
import { createFileRoute } from "@tanstack/react-router";
import { ProfileScreen } from "@/components/profile/Profile";


export const Route = createFileRoute("/_auth/profile")({
  component: RouteComponent,
});

function RouteComponent() {


  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <ProfileScreen />
      </div>
    </div>
  );
}
