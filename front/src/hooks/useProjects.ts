import { authFetch } from "@/lib/authFetch";
import { useQuery } from "@tanstack/react-query";

export interface BackendProject {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    shaders: number;
  };
}

export function useProjects(page: number, pageSize = 9) {
  return useQuery({
    queryKey: ["projects", page],
    queryFn: async () => {
      const res = await authFetch(
        `/api/projects?page=${page}&pageSize=${pageSize}`,
      );
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json() as Promise<{
        projects: BackendProject[];
        total: number;
      }>;
    },
  });
}
