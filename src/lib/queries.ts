import { supabase } from "@/integrations/supabase/client";
import type {
  Branch,
  Occurrence,
  Permission,
  Profile,
  Section,
  Shift,
  Task,
  TaskItem,
  Template,
} from "./domain";
import { deriveStatus } from "./domain";

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []) as T;
}

export async function fetchMyProfile(): Promise<Profile | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchBranches(): Promise<Branch[]> {
  return unwrap(await supabase.from("branches").select("*").order("number"));
}

export async function fetchShifts(): Promise<Shift[]> {
  return unwrap(await supabase.from("shifts").select("*").order("sort_order"));
}

export async function fetchSections(): Promise<Section[]> {
  return unwrap(await supabase.from("sections").select("*").order("sort_order"));
}

export async function fetchProfiles(): Promise<Profile[]> {
  return unwrap(await supabase.from("profiles").select("*").order("employee_number"));
}

export async function fetchTemplates(): Promise<Template[]> {
  return unwrap(await supabase.from("task_templates").select("*").order("name"));
}

export async function fetchPermissionMatrix(): Promise<
  Array<{ role: Profile["role"]; permission: string; allowed: boolean }>
> {
  return unwrap(await supabase.from("role_permissions").select("*"));
}

export async function fetchTasks(branchId?: string): Promise<Task[]> {
  let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });
  if (branchId) query = query.eq("branch_id", branchId);
  return unwrap(await query);
}

export async function fetchOccurrences(branchId?: string): Promise<Occurrence[]> {
  const from = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString();
  const to = new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString();
  let query = supabase
    .from("task_occurrences")
    .select("*")
    .gte("due_at", from)
    .lte("due_at", to)
    .order("due_at");
  if (branchId) query = query.eq("branch_id", branchId);
  return unwrap(await query);
}

export async function ensureOccurrences(branchId: string) {
  await supabase.rpc("generate_occurrences", { _branch_id: branchId, _horizon_hours: 24 });
}

export function buildTaskItems(tasks: Task[], occurrences: Occurrence[]): TaskItem[] {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const items: TaskItem[] = [];
  for (const occurrence of occurrences) {
    const task = byId.get(occurrence.task_id);
    if (!task || task.is_archived) continue;
    items.push({ occurrence, task, status: deriveStatus(occurrence) });
  }
  return items;
}

export function permissionSet(
  matrix: Array<{ role: Profile["role"]; permission: string; allowed: boolean }>,
  role: Profile["role"] | undefined,
): Set<Permission> {
  const set = new Set<Permission>();
  if (!role) return set;
  for (const row of matrix) {
    if (row.role === role && row.allowed) set.add(row.permission as Permission);
  }
  return set;
}

export async function logHistory(entry: {
  task_id: string;
  occurrence_id?: string | null;
  branch_id: string;
  actor_id: string | null;
  action: string;
  detail?: Record<string, unknown>;
}) {
  await supabase.from("task_history").insert({
    task_id: entry.task_id,
    occurrence_id: entry.occurrence_id ?? null,
    branch_id: entry.branch_id,
    actor_id: entry.actor_id,
    action: entry.action,
    detail: (entry.detail ?? {}) as never,
  });
}

export async function fetchTaskDetail(occurrenceId: string) {
  const occurrence = await supabase
    .from("task_occurrences")
    .select("*")
    .eq("id", occurrenceId)
    .maybeSingle();
  if (occurrence.error) throw new Error(occurrence.error.message);
  if (!occurrence.data) throw new Error("Task occurrence not found");

  const [task, notes, photos, history] = await Promise.all([
    supabase.from("tasks").select("*").eq("id", occurrence.data.task_id).maybeSingle(),
    supabase
      .from("task_notes")
      .select("*")
      .eq("task_id", occurrence.data.task_id)
      .order("created_at", { ascending: false }),
    supabase
      .from("task_photos")
      .select("*")
      .eq("task_id", occurrence.data.task_id)
      .order("created_at"),
    supabase
      .from("task_history")
      .select("*")
      .eq("task_id", occurrence.data.task_id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (!task.data) throw new Error("Task not found");
  return {
    occurrence: occurrence.data,
    task: task.data,
    notes: notes.data ?? [],
    photos: photos.data ?? [],
    history: history.data ?? [],
  };
}

export async function signedPhotoUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from("task-photos").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
