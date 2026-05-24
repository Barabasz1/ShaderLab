import { CommunityDashboard } from "@/components/dashboard/CommunityDashboard";
import { Topbar } from "@/components/layout/Topbar";
import { useCommunityProjects } from "@/hooks/useCommunityProjects";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/community")({
  component: RouteComponent,
});

function RouteComponent() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useCommunityProjects(page);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <CommunityDashboard
          title="Community Shaders"
          subtitle="Discover shaders made by others."
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
