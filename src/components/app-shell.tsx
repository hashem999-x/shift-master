import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Repeat,
  Settings,
  Users,
  WifiOff,
  BarChart3,
} from "lucide-react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useOnline } from "@/hooks/use-online";
import { useSession } from "@/components/session-provider";
import { ROLE_LABELS } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; show?: boolean };

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, branch, isAreaManager, can } = useSession();
  const online = useOnline();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const navItems: NavItem[] = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/tasks", label: "Tasks", icon: ClipboardList },
    { to: "/handover", label: "Handover", icon: Repeat },
    { to: "/team", label: "Team", icon: Users },
    { to: "/branches", label: "Branches", icon: Building2, show: isAreaManager },
    { to: "/reports", label: "Reports", icon: BarChart3, show: can("view_reports") },
    { to: "/settings", label: "Settings", icon: Settings },
  ].filter((item) => item.show !== false);

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar px-3 py-5 lg:flex">
          <div className="px-2">
            <p className="font-display text-lg font-extrabold tracking-tight">SHIFT<span className="text-primary">OPS</span></p>
            <p className="label-caps mt-1">Restaurant Operations</p>
          </div>
          <nav className="mt-6 flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="truncate text-sm font-semibold">{profile?.full_name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">
              {profile ? ROLE_LABELS[profile.role] : ""}
            </p>
            <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={signOut}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-24 lg:pb-8">
          <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="label-caps">
                  {branch ? `Branch ${branch.number} · ${branch.name}` : "All branches"}
                </p>
                <p className="truncate font-display text-base font-bold">
                  {profile?.full_name ?? "Loading"}
                  <span className="ml-2 text-xs font-medium text-muted-foreground">
                    {profile ? ROLE_LABELS[profile.role] : ""}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!online && (
                  <span className="flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
                    <WifiOff className="size-3.5" /> Offline
                  </span>
                )}
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={signOut}>
                  <LogOut className="size-4" />
                </Button>
              </div>
            </div>
          </header>
          <main className="px-4 py-5">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-sidebar/98 backdrop-blur lg:hidden">
        <div className="flex items-stretch justify-around">
          {navItems.slice(0, 5).map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
