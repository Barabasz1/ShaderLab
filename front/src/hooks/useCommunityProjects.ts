import { authFetch } from "@/lib/authFetch";
import { useQuery } from "@tanstack/react-query";
import { BackendProject } from "./useProjects";

export function useCommunityProjects(page: number, pageSize = 9) {
  return useQuery({
    queryKey: ["communityProjects", page],
    queryFn: async () => {
      const res = await authFetch(
        `/api/projects/community?page=${page}&pageSize=${pageSize}`,
      );
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json() as Promise<{
        projects: BackendProject[];
        total: number;
      }>;
    },
  });
}
