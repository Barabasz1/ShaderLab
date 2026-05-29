import { Loader2, PuzzleIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { getGradientForId } from "./Dashboard";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authFetch } from "@/lib/authFetch";
import { useState } from "react";

export interface PuzzleListItem {
  id: string;
  name: string | null;
  description: string | null;
}

interface PuzzlesDashboardProps {
  title: string;
  subtitle: string;
  puzzles: PuzzleListItem[];
  isLoading: boolean;
  error: Error | null;
}

interface SubmissionShaderResponse {
  shaderId: string;
}

export function PuzzlesDashboard({
  title,
  subtitle,
  puzzles,
  isLoading,
  error,
}: PuzzlesDashboardProps) {
  const navigate = useNavigate();
  const [openingPuzzleId, setOpeningPuzzleId] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  const openPuzzle = async (puzzleId: string) => {
    if (openingPuzzleId) return;

    setOpeningPuzzleId(puzzleId);
    setOpenError(null);

    try {
      const res = await authFetch(`/api/puzzles/${puzzleId}/submission-shader`);
      if (!res.ok) throw new Error("Failed to load your puzzle submission shader");

      const { shaderId } = (await res.json()) as SubmissionShaderResponse;

      await navigate({
        to: "/$projectId/editor",
        params: { projectId: shaderId },
        search: { puzzleId },
      });
    } catch (err) {
      setOpenError(err instanceof Error ? err.message : "Failed to open puzzle");
    } finally {
      setOpeningPuzzleId(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-1 flex-col p-8 h-full overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2">{subtitle}</p>
        </div>
      </div>

      {openError && (
        <div className="text-red-500 bg-red-500/10 p-4 rounded-md mb-4">
          {openError}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-red-500 bg-red-500/10 p-4 rounded-md">
          {error.message}
        </div>
      ) : puzzles.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No puzzles yet.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {puzzles.map((puzzle) => {
              const isOpening = openingPuzzleId === puzzle.id;

              return (
                <Card
                  key={puzzle.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openPuzzle(puzzle.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openPuzzle(puzzle.id);
                    }
                  }}
                  className="flex flex-col pt-0 h-full cursor-pointer overflow-hidden transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div
                    className={`h-40 w-full bg-linear-to-br ${getGradientForId(
                      puzzle.id,
                    )}`}
                  />

                  <CardHeader className="relative">
                    <CardTitle>{puzzle.name ?? "Untitled Puzzle"}</CardTitle>
                    <CardDescription className="min-h-5">
                      {puzzle.description ?? ""}
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="flex justify-between items-center border-t pt-6 mt-auto">
                    <span className="text-sm text-muted-foreground">
                      Puzzle challenge
                    </span>
                    <Button
                      variant="default"
                      disabled={isOpening}
                      onClick={(event) => {
                        event.stopPropagation();
                        openPuzzle(puzzle.id);
                      }}
                    >
                      {isOpening ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <PuzzleIcon className="mr-2 h-4 w-4" />
                      )}
                      Open Puzzle
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
