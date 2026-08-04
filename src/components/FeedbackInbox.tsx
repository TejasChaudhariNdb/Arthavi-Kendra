"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bug,
  Lightbulb,
  MessageCircle,
  CheckCircle,
  Eye,
  Clock,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp("(^| )admin_token=([^;]+)"));
    if (match) return match[2];
  }
  return "";
}

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  bug: {
    label: "Bug",
    icon: Bug,
    color: "text-red-400 bg-red-900/30 border-red-800",
  },
  feature: {
    label: "Feature",
    icon: Lightbulb,
    color: "text-yellow-400 bg-yellow-900/30 border-yellow-800",
  },
  feedback: {
    label: "Feedback",
    icon: MessageCircle,
    color: "text-blue-400 bg-blue-900/30 border-blue-800",
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  new: {
    label: "New",
    color: "text-red-400 bg-red-900/30 border-red-800",
    icon: Clock,
  },
  seen: {
    label: "Seen",
    color: "text-yellow-400 bg-yellow-900/30 border-yellow-800",
    icon: Eye,
  },
  accepted: {
    label: "Accepted",
    color: "text-blue-400 bg-blue-900/30 border-blue-800",
    icon: CheckCircle,
  },
  in_progress: {
    label: "In Progress",
    color: "text-amber-400 bg-amber-900/30 border-amber-800",
    icon: Clock,
  },
  resolved: {
    label: "Resolved",
    color: "text-emerald-400 bg-emerald-900/30 border-emerald-800",
    icon: CheckCircle,
  },
  not_feasible: {
    label: "Not Feasible",
    color: "text-rose-400 bg-rose-900/30 border-rose-800",
    icon: CheckCircle,
  },
};

interface FeedbackItem {
  id: number;
  type: string;
  title: string;
  body: string | null;
  status: string;
  action_taken?: string | null;
  created_at: string;
  created_at_iso?: string | null;
  user: { id: number; email: string; full_name: string | null } | null;
}

interface FeedbackCardProps {
  item: FeedbackItem;
  updating: boolean;
  onUpdate: (id: number, status: string, action_taken: string) => Promise<void>;
}

function FeedbackCard({ item, updating, onUpdate }: FeedbackCardProps) {
  const [status, setStatus] = useState(item.status);
  const [actionTaken, setActionTaken] = useState(item.action_taken || "");
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    setStatus(item.status);
    setActionTaken(item.action_taken || "");
    setIsSaved(true);
  }, [item]);

  const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.feedback;
  const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.new;
  const TypeIcon = typeCfg.icon;
  const StatusIcon = statusCfg.icon;

  const created = item.created_at_iso ? new Date(item.created_at_iso) : null;
  let ageLabel = "Unknown";
  let ageCls = "text-gray-500 bg-gray-800 border-gray-700";
  if (created && !Number.isNaN(created.getTime())) {
    const ageHours = (Date.now() - created.getTime()) / (1000 * 60 * 60);
    if (ageHours < 24) {
      ageLabel = "<24h";
      ageCls = "text-emerald-300 bg-emerald-900/30 border-emerald-800";
    } else if (ageHours <= 72) {
      ageLabel = "1-3d";
      ageCls = "text-amber-300 bg-amber-900/30 border-amber-800";
    } else {
      ageLabel = ">3d";
      ageCls = "text-rose-300 bg-rose-900/30 border-rose-800";
    }
  }

  const handleSave = async () => {
    await onUpdate(item.id, status, actionTaken);
    setIsSaved(true);
  };

  return (
    <div
      className={`bg-gray-950 border rounded-xl p-5 transition-all ${
        item.status === "new" ? "border-red-900/50" : "border-gray-800"
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Top row: details and badges */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${typeCfg.color}`}>
              <TypeIcon className="w-3.5 h-3.5" />
              {typeCfg.label}
            </span>
            <div className="min-w-0">
              <h3 className="text-white font-semibold text-sm leading-snug truncate">
                {item.title}
              </h3>
              {item.body && (
                <p className="text-gray-400 text-sm mt-1 leading-relaxed whitespace-pre-wrap">
                  {item.body}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-xs text-gray-600">
                  {item.user ? (
                    <span>
                      <span className="text-gray-400 font-medium">#{item.user.id}</span>{" "}
                      {item.user.full_name || item.user.email}
                    </span>
                  ) : (
                    "Anonymous"
                  )}
                </span>
                <span className="text-xs text-gray-600">{item.created_at}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${ageCls}`}>
                  {ageLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${statusCfg.color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusCfg.label}
            </span>
            {item.user?.id && (
              <Link
                href={`/users/${item.user.id}`}
                className="text-xs px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Open User
              </Link>
            )}
          </div>
        </div>

        {/* Action Taken Response Section */}
        <div className="border-t border-gray-800 pt-4 mt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Add response note (e.g. Action taken / resolution status)..."
              value={actionTaken}
              onChange={(e) => {
                setActionTaken(e.target.value);
                setIsSaved(false);
              }}
              className="w-full bg-gray-900 border border-gray-800 focus:border-emerald-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setIsSaved(false);
              }}
              className="bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-300 focus:outline-none focus:border-emerald-600"
            >
              <option value="new">New</option>
              <option value="seen">Seen</option>
              <option value="accepted">Accepted</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="not_feasible">Not Feasible</option>
            </select>
            <button
              onClick={handleSave}
              disabled={updating || isSaved}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                isSaved
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 active:scale-95"
              }`}
            >
              {updating ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeedbackInbox() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const url =
        filter === "all"
          ? `${API_URL}/feedback/admin/list`
          : `${API_URL}/feedback/admin/list?status=${filter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) setItems(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const updateFeedbackData = async (id: number, status: string, action_taken: string) => {
    setUpdating(id);
    try {
      const token = getToken();
      await fetch(`${API_URL}/feedback/admin/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, action_taken }),
      });
      setItems((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status, action_taken } : f))
      );
    } finally {
      setUpdating(null);
    }
  };

  const counts = {
    all: items.length,
    new: items.filter((f) => f.status === "new").length,
    seen: items.filter((f) => f.status === "seen").length,
    accepted: items.filter((f) => f.status === "accepted").length,
    in_progress: items.filter((f) => f.status === "in_progress").length,
    resolved: items.filter((f) => f.status === "resolved").length,
    not_feasible: items.filter((f) => f.status === "not_feasible").length,
  };

  const visibleItems = items
    .filter((f) => filter === "all" || f.status === filter)
    .sort((a, b) => {
      const unresolvedA = a.status === "resolved" ? 1 : 0;
      const unresolvedB = b.status === "resolved" ? 1 : 0;
      if (unresolvedA !== unresolvedB) return unresolvedA - unresolvedB;

      const aTs = a.created_at_iso ? new Date(a.created_at_iso).getTime() : 0;
      const bTs = b.created_at_iso ? new Date(b.created_at_iso).getTime() : 0;
      return aTs - bTs; // oldest first
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Feedback Inbox
          </h1>
          <p className="text-gray-400 mt-1">
            User bug reports, feature requests, and suggestions
          </p>
        </div>
        <button
          onClick={fetchFeedback}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize flex items-center gap-2 ${
              filter === key
                ? "bg-emerald-600 text-white"
                : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600"
            }`}>
            {key.replace("_", " ")}{" "}
            {count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${filter === key ? "bg-white/20" : "bg-gray-700"}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading...</div>
      ) : visibleItems.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No feedback in this category yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleItems.map((item) => (
            <FeedbackCard
              key={item.id}
              item={item}
              updating={updating === item.id}
              onUpdate={updateFeedbackData}
            />
          ))}
        </div>
      )}
    </div>
  );
}
