import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Topbar } from "@/components/layout/Topbar";
import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";

export const Route = createFileRoute("/_auth/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useProjects(page);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Dashboard
          title="My Shaders"
          subtitle="Manage and edit your creative coding projects."
          data={data}
          isLoading={isLoading}
          error={error}
          page={page}
          pageSize={9}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
