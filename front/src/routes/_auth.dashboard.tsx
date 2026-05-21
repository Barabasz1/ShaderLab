import { LogoutButton } from "@/components/auth/LogoutButton";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      Hello "/dashboard"!
      <LogoutButton className="ml-auto" />
    </div>
  );
}
