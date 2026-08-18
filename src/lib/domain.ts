import type { Tables } from "@/integrations/supabase/types";

export type Branch = Tables<"branches">;
export type Shift = Tables<"shifts">;
export type Profile = Tables<"profiles">;
export type Section = Tables<"sections">;
export type Task = Tables<"tasks">;
export type Occurrence = Tables<"task_occurrences">;
export type TaskNote = Tables<"task_notes">;
export type TaskPhoto = Tables<"task_photos">;
export type TaskHistory = Tables<"task_history">;
export type Template = Tables<"task_templates">;
export type Handover = Tables<"shift_handovers">;
export type AppRole = Task["priority"] extends never ? never : Profile["role"];
export type Priority = Task["priority"];

export type DerivedStatus = "pending" | "overdue" | "completed";

export type TaskItem = {
  occurrence: Occurrence;
  task: Task;
  status: DerivedStatus;
};

export const PERMISSIONS = [
  "create_tasks",
  "edit_tasks",
  "delete_tasks",
  "assign_tasks",
  "manage_sections",
  "manage_templates",
  "manage_users",
  "view_reports",
  "cross_branch",
  "management_tasks",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  create_tasks: "Create tasks",
  edit_tasks: "Edit tasks",
  delete_tasks: "Delete tasks",
  assign_tasks: "Assign tasks",
  manage_sections: "Manage sections",
  manage_templates: "Manage templates",
  manage_users: "Manage users",
  view_reports: "View reports",
  cross_branch: "Cross-branch visibility",
  management_tasks: "See management tasks",
};

export const ROLE_LABELS: Record<Profile["role"], string> = {
  area_manager: "Area Manager",
  branch_manager: "Branch Manager",
  shift_manager: "Shift Manager",
  employee: "Employee",
};

export const RECURRENCE_OPTIONS = [
  { value: "once", label: "One time only" },
  { value: "minutes:30", label: "Every 30 minutes" },
  { value: "minutes:60", label: "Every hour" },
  { value: "minutes:120", label: "Every 2 hours" },
  { value: "minutes:180", label: "Every 3 hours" },
  { value: "minutes:240", label: "Every 4 hours" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "minutes:87840", label: "Every 2 months" },
  { value: "minutes:131760", label: "Every 3 months" },
  { value: "minutes:263520", label: "Every 6 months" },
  { value: "yearly", label: "Yearly" },
] as const;

export const REMINDER_OPTIONS = [
  { value: "0", label: "No reminder" },
  { value: "15", label: "15 minutes before" },
  { value: "30", label: "30 minutes before" },
  { value: "60", label: "1 hour before" },
  { value: "180", label: "3 hours before" },
  { value: "1440", label: "1 day before" },
] as const;

export function recurrenceValue(task: Pick<Task, "recurrence" | "interval_minutes">): string {
  if (task.recurrence === "minutes") return `minutes:${task.interval_minutes ?? 60}`;
  return task.recurrence;
}

export function parseRecurrence(value: string): {
  recurrence: string;
  interval_minutes: number | null;
} {
  if (value.startsWith("minutes:")) {
    return { recurrence: "minutes", interval_minutes: Number(value.split(":")[1]) };
  }
  return { recurrence: value, interval_minutes: null };
}

export function recurrenceLabel(task: Pick<Task, "recurrence" | "interval_minutes">): string {
  const value = recurrenceValue(task);
  return RECURRENCE_OPTIONS.find((option) => option.value === value)?.label ?? "Custom schedule";
}

export function deriveStatus(occurrence: Occurrence, now = new Date()): DerivedStatus {
  if (occurrence.status === "completed") return "completed";
  return new Date(occurrence.due_at).getTime() < now.getTime() ? "overdue" : "pending";
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/** High+overdue, High, Medium+overdue, Medium, Low+overdue, Low, then completed. */
export function sortTaskItems(items: TaskItem[]): TaskItem[] {
  return [...items].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (b.status === "completed" && a.status !== "completed") return -1;
    if (a.status !== "completed") {
      const rank =
        PRIORITY_RANK[a.task.priority] * 2 +
        (a.status === "overdue" ? 0 : 1) -
        (PRIORITY_RANK[b.task.priority] * 2 + (b.status === "overdue" ? 0 : 1));
      if (rank !== 0) return rank;
    }
    return new Date(a.occurrence.due_at).getTime() - new Date(b.occurrence.due_at).getTime();
  });
}

export function formatTime(value: string | Date): string {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDay(value: string | Date): string {
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function shiftWindowLabel(shift: Pick<Shift, "start_time" | "end_time">): string {
  const fmt = (time: string) => {
    const [h, m] = time.split(":");
    const date = new Date();
    date.setHours(Number(h), Number(m), 0, 0);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };
  return `${fmt(shift.start_time)} - ${fmt(shift.end_time)}`;
}

export function isShiftActive(shift: Pick<Shift, "start_time" | "end_time">, now = new Date()) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const toMinutes = (time: string) => {
    const parts = time.split(":").map(Number);
    return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  };
  const start = toMinutes(shift.start_time);
  const end = toMinutes(shift.end_time);
  return start <= end ? minutes >= start && minutes < end : minutes >= start || minutes < end;
}
