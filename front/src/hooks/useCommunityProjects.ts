import { authFetch } from "@/lib/authFetch";
import { useQuery } from "@tanstack/react-query";
import { BackendProject } from "./useProjects";

export function useCommunityProjects(page: number, pageSize = 9, search = "") {
  return useQuery({
    queryKey: ["communityProjects", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(search && { search }),
      });
      const res = await authFetch(`/api/projects/community?${params}`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json() as Promise<{ projects: BackendProject[]; total: number }>;
    },
  });
}