import { Clock, CheckCircle, PauseCircle } from "lucide-react";
import React from "react";

export type FeedbackStatus = "under_review" | "in_progress" | "live" | "on_hold";

export interface StatusMeta {
  id: FeedbackStatus;
  label: string;
  emoji: string;
  badgeColor: string;
  icon: React.ElementType;
}

export const FEEDBACK_STATUSES: StatusMeta[] = [
  {
    id: "under_review",
    label: "Under Review",
    emoji: "🟡",
    badgeColor: "text-amber-400 bg-amber-900/30 border-amber-800",
    icon: Clock,
  },
  {
    id: "in_progress",
    label: "In Progress",
    emoji: "🔵",
    badgeColor: "text-blue-400 bg-blue-900/30 border-blue-800",
    icon: Clock,
  },
  {
    id: "live",
    label: "Live / Done",
    emoji: "🟢",
    badgeColor: "text-emerald-400 bg-emerald-900/30 border-emerald-800",
    icon: CheckCircle,
  },
  {
    id: "on_hold",
    label: "On Hold",
    emoji: "⏸️",
    badgeColor: "text-zinc-400 bg-zinc-900/40 border-zinc-800",
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
