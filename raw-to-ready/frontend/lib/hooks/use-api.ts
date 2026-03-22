import useSWR, { mutate as globalMutate } from "swr";
import { api } from "@/lib/api";

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR("projects", () =>
    api.listProjects()
  );
  return {
    projects: data ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useProject(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["project", id] : null,
    () => api.getProject(id!)
  );
  return {
    project: data ?? null,
    isLoading,
    error,
    mutate,
  };
}

export function useToolInstances(
  toolSlug: string,
  projectId: string | null
) {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? ["tool-instances", toolSlug, projectId] : null,
    () => api.getToolData(toolSlug, projectId!)
  );
  return {
    instances: data ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useRecommendations(projectId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? ["recommendations", projectId] : null,
    () => api.getRecommendations(projectId!)
  );
  return {
    data: data ?? null,
    isLoading,
    error,
    mutate,
  };
}

/** Invalidate the projects list cache from anywhere */
export function invalidateProjects() {
  return globalMutate("projects");
}

/** Invalidate a specific project's cache */
export function invalidateProject(id: string) {
  return globalMutate(["project", id]);
}

/** Invalidate tool instances for a specific tool+project */
export function invalidateToolInstances(
  toolSlug: string,
  projectId: string
) {
  return globalMutate(["tool-instances", toolSlug, projectId]);
}
