import { PuzzlesDashboard, type PuzzleListItem } from "@/components/dashboard/PuzzlesDashboard";
import { Topbar } from "@/components/layout/Topbar";
import { authFetch } from "@/lib/authFetch";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_auth/puzzles")({
  component: RouteComponent,
});

function RouteComponent() {
  const [puzzles, setPuzzles] = useState<PuzzleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    authFetch("/api/puzzles")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load puzzles");
        return res.json();
      })
      .then(setPuzzles)
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <PuzzlesDashboard
          title="Puzzles"
          subtitle="Choose a shader puzzle and match the target output."
          puzzles={puzzles}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
