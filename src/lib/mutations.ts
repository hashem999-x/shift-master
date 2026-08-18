import { supabase } from "@/integrations/supabase/client";
import { logHistory } from "./queries";
import type { Occurrence, Task } from "./domain";

export async function completeOccurrence(input: {
  occurrence: Occurrence;
  task: Task;
  profileId: string | null;
  note?: string;
}) {
  const { error } = await supabase
    .from("task_occurrences")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      completed_by: input.profileId,
      completion_note: input.note ?? null,
    })
    .eq("id", input.occurrence.id);
  if (error) throw new Error(error.message);

  await logHistory({
    task_id: input.task.id,
    occurrence_id: input.occurrence.id,
    branch_id: input.task.branch_id,
    actor_id: input.profileId,
    action: "completed",
    detail: { note: input.note ?? null },
  });
}

export async function reopenOccurrence(input: {
  occurrence: Occurrence;
  task: Task;
  profileId: string | null;
}) {
  const { error } = await supabase
    .from("task_occurrences")
    .update({ status: "pending", completed_at: null, completed_by: null })
    .eq("id", input.occurrence.id);
  if (error) throw new Error(error.message);
  await logHistory({
    task_id: input.task.id,
    occurrence_id: input.occurrence.id,
    branch_id: input.task.branch_id,
    actor_id: input.profileId,
    action: "reopened",
  });
}

export async function addNote(input: {
  task: Task;
  occurrenceId: string | null;
  profileId: string | null;
  body: string;
}) {
  const { error } = await supabase.from("task_notes").insert({
    task_id: input.task.id,
    occurrence_id: input.occurrenceId,
    branch_id: input.task.branch_id,
    author_id: input.profileId,
    body: input.body,
  });
  if (error) throw new Error(error.message);
  await logHistory({
    task_id: input.task.id,
    occurrence_id: input.occurrenceId,
    branch_id: input.task.branch_id,
    actor_id: input.profileId,
    action: "note_added",
    detail: { body: input.body },
  });
}

export async function uploadTaskPhoto(input: {
  file: File;
  kind: "before" | "after";
  task: Task;
  occurrenceId: string | null;
  profileId: string | null;
}) {
  const extension = input.file.name.split(".").pop() ?? "jpg";
  const path = `${input.task.branch_id}/${input.task.id}/${input.kind}-${Date.now()}.${extension}`;
  const upload = await supabase.storage.from("task-photos").upload(path, input.file);
  if (upload.error) throw new Error(upload.error.message);

  const { error } = await supabase.from("task_photos").insert({
    task_id: input.task.id,
    occurrence_id: input.occurrenceId,
    branch_id: input.task.branch_id,
    kind: input.kind,
    path,
    uploaded_by: input.profileId,
  });
  if (error) throw new Error(error.message);

  await logHistory({
    task_id: input.task.id,
    occurrence_id: input.occurrenceId,
    branch_id: input.task.branch_id,
    actor_id: input.profileId,
    action: `photo_${input.kind}`,
    detail: { path },
  });
}

export type TaskInput = {
  id?: string;
  branch_id: string;
  section_id: string | null;
  title: string;
  description: string | null;
  priority: Task["priority"];
  assigned_to: string | null;
  assigned_shift_id: string | null;
  assign_all: boolean;
  is_management: boolean;
  is_temporary: boolean;
  start_date: string;
  end_date: string | null;
  due_time: string | null;
  recurrence: string;
  interval_minutes: number | null;
  reminder_minutes: number | null;
  notes: string | null;
};

export async function saveTask(input: TaskInput, profileId: string | null) {
  if (input.id) {
    const { id, ...rest } = input;
    const { error } = await supabase.from("tasks").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
    await logHistory({
      task_id: id,
      branch_id: input.branch_id,
      actor_id: profileId,
      action: "edited",
      detail: { title: input.title },
    });
    await supabase.rpc("generate_occurrences", {
      _branch_id: input.branch_id,
      _horizon_hours: 24,
    });
    return id;
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...input, created_by: profileId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await logHistory({
    task_id: data.id,
    branch_id: input.branch_id,
    actor_id: profileId,
    action: "created",
    detail: { title: input.title },
  });
  await supabase.rpc("generate_occurrences", { _branch_id: input.branch_id, _horizon_hours: 24 });
  return data.id;
}

export async function updateTaskFlags(
  task: Task,
  patch: Partial<Pick<Task, "is_paused" | "is_archived" | "priority" | "section_id" | "assigned_to">>,
  profileId: string | null,
  action: string,
) {
  const { error } = await supabase.from("tasks").update(patch).eq("id", task.id);
  if (error) throw new Error(error.message);
  await logHistory({
    task_id: task.id,
    branch_id: task.branch_id,
    actor_id: profileId,
    action,
    detail: patch as Record<string, unknown>,
  });
}

export async function duplicateTask(task: Task, profileId: string | null, branchId?: string) {
  const { id, created_at, updated_at, created_by, ...rest } = task;
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      ...rest,
      branch_id: branchId ?? task.branch_id,
      title: branchId && branchId !== task.branch_id ? task.title : `${task.title} (Copy)`,
      created_by: profileId,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  await supabase.rpc("generate_occurrences", {
    _branch_id: branchId ?? task.branch_id,
    _horizon_hours: 24,
  });
  return data.id;
}

export async function deleteTask(task: Task) {
  const { error } = await supabase.from("tasks").delete().eq("id", task.id);
  if (error) throw new Error(error.message);
}

export async function toggleFavorite(taskId: string, profileId: string, isFavorite: boolean) {
  if (isFavorite) {
    await supabase.from("task_favorites").delete().eq("task_id", taskId).eq("profile_id", profileId);
  } else {
    await supabase.from("task_favorites").insert({ task_id: taskId, profile_id: profileId });
  }
}

export async function createHandover(input: {
  branch_id: string;
  from_profile_id: string | null;
  from_shift_id: string | null;
  to_shift_id: string | null;
  notes: string;
  overtime_taken: boolean;
  completed_count: number;
  pending_count: number;
  overdue_count: number;
}) {
  const { error } = await supabase.from("shift_handovers").insert(input);
  if (error) throw new Error(error.message);
}
