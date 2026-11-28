import { Clock, CheckCircle, PauseCircle } from "lucide-react";
import React from "react";

export type FeedbackStatus = "under_review" | "in_progress" | "live" | "on_hold";

export interface StatusMeta {
  id: FeedbackStatus;
  label: string;
  emoji: string;
  badgeColor: string;
  dot: string;
  icon: React.ElementType;
}

export const FEEDBACK_STATUSES: StatusMeta[] = [
  {
    id: "under_review",
    dot: "bg-amber-500",
    label: "Under Review",
    emoji: "🟡",
    badgeColor: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-900/30 dark:border-amber-800",
    icon: Clock,
  },
  {
    id: "in_progress",
    dot: "bg-blue-500",
    label: "In Progress",
    emoji: "🔵",
    badgeColor: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-800",
    icon: Clock,
  },
  {
    id: "live",
    dot: "bg-emerald-500",
    label: "Live / Done",
    emoji: "🟢",
    badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-800",
    icon: CheckCircle,
  },
  {
    id: "on_hold",
    dot: "bg-slate-400",
    label: "On Hold",
    emoji: "⏸️",
    badgeColor: "text-slate-600 bg-slate-100 border-slate-200 dark:text-zinc-300 dark:bg-zinc-900/40 dark:border-zinc-700",
    icon: PauseCircle,
  },
];

export const FEEDBACK_STATUS_MAP: Record<FeedbackStatus, StatusMeta> = FEEDBACK_STATUSES.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<FeedbackStatus, StatusMeta>
);

export function normalizeFeedbackStatus(rawStatus?: string | null): FeedbackStatus {
  if (!rawStatus) return "under_review";
  const s = rawStatus.toLowerCase();
  if (s === "new" || s === "seen" || s === "under_review") return "under_review";
  if (s === "accepted" || s === "in_progress") return "in_progress";
  if (s === "resolved" || s === "live") return "live";
  if (s === "not_feasible" || s === "shelved" || s === "on_hold") return "on_hold";
  return "under_review";
}

export function getFeedbackStatusMeta(rawStatus?: string | null): StatusMeta {
  const normalized = normalizeFeedbackStatus(rawStatus);
  return FEEDBACK_STATUS_MAP[normalized];
}
