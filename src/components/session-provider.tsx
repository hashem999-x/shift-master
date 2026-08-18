import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  fetchBranches,
  fetchMyProfile,
  fetchPermissionMatrix,
  fetchProfiles,
  fetchSections,
  fetchShifts,
  permissionSet,
} from "@/lib/queries";
import type { Branch, Permission, Profile, Section, Shift } from "@/lib/domain";

type SessionValue = {
  profile: Profile | null;
  branch: Branch | null;
  branches: Branch[];
  shifts: Shift[];
  sections: Section[];
  people: Profile[];
  permissions: Set<Permission>;
  can: (permission: Permission) => boolean;
  isManager: boolean;
  isAreaManager: boolean;
  loading: boolean;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const profileQuery = useQuery({ queryKey: ["me"], queryFn: fetchMyProfile });
  const branchesQuery = useQuery({ queryKey: ["branches"], queryFn: fetchBranches });
  const shiftsQuery = useQuery({ queryKey: ["shifts"], queryFn: fetchShifts });
  const sectionsQuery = useQuery({ queryKey: ["sections"], queryFn: fetchSections });
  const peopleQuery = useQuery({ queryKey: ["people"], queryFn: fetchProfiles });
  const matrixQuery = useQuery({ queryKey: ["permissions"], queryFn: fetchPermissionMatrix });

  const value = useMemo<SessionValue>(() => {
    const profile = profileQuery.data ?? null;
    const branches = branchesQuery.data ?? [];
    const permissions = permissionSet(matrixQuery.data ?? [], profile?.role);
    return {
      profile,
      branch: branches.find((item) => item.id === profile?.branch_id) ?? null,
      branches,
      shifts: shiftsQuery.data ?? [],
      sections: sectionsQuery.data ?? [],
      people: peopleQuery.data ?? [],
      permissions,
      can: (permission: Permission) => permissions.has(permission),
      isManager: profile?.role === "area_manager" || profile?.role === "branch_manager",
      isAreaManager: profile?.role === "area_manager",
      loading:
        profileQuery.isLoading ||
        branchesQuery.isLoading ||
        sectionsQuery.isLoading ||
        matrixQuery.isLoading,
    };
  }, [
    profileQuery.data,
    profileQuery.isLoading,
    branchesQuery.data,
    branchesQuery.isLoading,
    shiftsQuery.data,
    sectionsQuery.data,
    sectionsQuery.isLoading,
    peopleQuery.data,
    matrixQuery.data,
    matrixQuery.isLoading,
  ]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider");
  return context;
}

export function personName(people: Profile[], id: string | null | undefined): string {
  if (!id) return "Unassigned";
  return people.find((person) => person.id === id)?.full_name ?? "Unknown";
}
