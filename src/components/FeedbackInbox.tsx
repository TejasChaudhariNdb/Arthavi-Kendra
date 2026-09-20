"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bug,
  Lightbulb,
  MessageCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Heart,
  AlertTriangle,
  Sparkles,
  Send,
  MessageSquare,
  ThumbsUp,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  FEEDBACK_STATUSES,
  getFeedbackStatusMeta,
  normalizeFeedbackStatus,
  FeedbackStatus,
} from "@/lib/feedbackStatus";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

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
  appreciation: {
    label: "Appreciation",
    icon: Heart,
    color: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800",
  },
  criticism: {
    label: "Area for Improvement",
    icon: AlertTriangle,
    color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
  },
  data_mismatch: {
    label: "Data Mismatch",
    icon: AlertTriangle,
    color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800",
  },
  delay: {
    label: "Response Delay",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
  },
  bug: {
    label: "Bug Report",
    icon: Bug,
    color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
  },
  ui_ux: {
    label: "UI / UX Idea",
    icon: Sparkles,
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
  },
  idea: {
    label: "General Idea",
    icon: Lightbulb,
    color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800",
  },
  feature: {
    label: "Feature Request",
    icon: Lightbulb,
    color: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800",
  },
  feedback: {
    label: "Feedback",
    icon: MessageCircle,
    color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
  },
};

interface CommentItem {
  id: number;
  comment: string;
  author_name: string;
  is_admin: boolean;
  created_at: string;
}

interface FeedbackItem {
  id: number;
  main_category: string;
  type: string;
  title: string;
  body: string | null;
  status: string;
  action_taken?: string | null;
  agree_count?: number;
  comments_count?: number;
  comments?: CommentItem[];
  created_at: string;
  created_at_iso?: string | null;
  user: { id: number; email: string; full_name: string | null } | null;
}

interface FeedbackCardProps {
  item: FeedbackItem;
  updating: boolean;
  onUpdate: (id: number, status: string, action_taken: string) => Promise<void>;
  onAddComment: (id: number, commentText: string) => Promise<void>;
}

function FeedbackCard({ item, updating, onUpdate, onAddComment }: FeedbackCardProps) {
  const [status, setStatus] = useState(normalizeFeedbackStatus(item.status));
  const [actionTaken, setActionTaken] = useState(item.action_taken || "");
  const [isSaved, setIsSaved] = useState(true);
  const [adminCommentText, setAdminCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    setStatus(normalizeFeedbackStatus(item.status));
    setActionTaken(item.action_taken || "");
    setIsSaved(true);
  }, [item]);

  const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.feedback;
  const statusCfg = getFeedbackStatusMeta(item.status);
  const TypeIcon = typeCfg.icon;
  const StatusIcon = statusCfg.icon;

  const created = item.created_at_iso ? new Date(item.created_at_iso) : null;
  let ageLabel = "Unknown";
  let ageCls = "text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
  if (created && !Number.isNaN(created.getTime())) {
    const ageHours = (Date.now() - created.getTime()) / (1000 * 60 * 60);
    if (ageHours < 24) {
      ageLabel = "<24h";
      ageCls = "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800";
    } else if (ageHours <= 72) {
      ageLabel = "1-3d";
      ageCls = "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800";
    } else {
      ageLabel = ">3d";
      ageCls = "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800";
    }
  }

  const handleSave = async () => {
    await onUpdate(item.id, status, actionTaken);
    setIsSaved(true);
  };

  const handleCommentSubmit = async () => {
    if (!adminCommentText.trim()) return;
    setPostingComment(true);
    try {
      await onAddComment(item.id, adminCommentText.trim());
      setAdminCommentText("");
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <Card
      className={`p-5 transition-all ${
        item.status === "new"
          ? "border-indigo-400 dark:border-indigo-500/40 shadow-sm"
          : "border-slate-200/80 dark:border-white/[0.08]"
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Top row: details and badges */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Channel badge */}
            <span
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${
                item.main_category === "feedback"
                  ? "text-pink-700 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800"
                  : "text-amber-700 dark:text-yellow-400 bg-amber-50 dark:bg-yellow-950/40 border-amber-200 dark:border-yellow-800"
              }`}
            >
              {item.main_category === "feedback" ? "Feedback" : "Suggestion"}
            </span>

            {/* Type badge */}
            <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${typeCfg.color}`}>
              <TypeIcon className="w-3.5 h-3.5" />
              {typeCfg.label}
            </span>

            <div className="min-w-0 flex-1">
              <h3 className="text-slate-900 dark:text-white font-bold text-sm leading-snug truncate">
                {item.title}
              </h3>
              {item.body && (
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed whitespace-pre-wrap">
                  {item.body}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                <span>
                  {item.user ? (
                    <span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">#{item.user.id}</span>{" "}
                      {item.user.full_name || item.user.email}
                    </span>
                  ) : (
                    "Anonymous"
                  )}
                </span>
                <span>•</span>
                <span>{item.created_at}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${ageCls}`}>
                  {ageLabel}
                </span>
                {item.agree_count && item.agree_count > 0 ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
                    <ThumbsUp className="w-3 h-3" /> {item.agree_count} agree
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${statusCfg.badgeColor}`}>
              <StatusIcon className="w-3 h-3" />
              {statusCfg.label}
            </span>
            {item.user?.id && (
              <Link
                href={`/users/${item.user.id}`}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center gap-1 font-semibold"
              >
                <ExternalLink className="w-3 h-3" />
                Open User
              </Link>
            )}
          </div>
        </div>

        {/* Action Taken Response Section */}
        <div className="border-t border-slate-200/80 dark:border-white/[0.08] pt-4 mt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Official Response / Release Note (Optional)..."
              value={actionTaken}
              onChange={(e) => {
                setActionTaken(e.target.value);
                setIsSaved(false);
              }}
              className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as FeedbackStatus);
                setIsSaved(false);
              }}
              className="bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {FEEDBACK_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleSave}
              disabled={updating || isSaved}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                isSaved
                  ? "bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-white/[0.06]"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-95"
              }`}
            >
              {updating ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Community Comments Thread Toggle */}
        <div className="border-t border-slate-200/60 dark:border-white/[0.04] pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 font-semibold transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Community Comments ({item.comments?.length || 0})</span>
            </button>
          </div>

          {showComments && (
            <div className="mt-2 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-3.5 space-y-3">
              {item.comments && item.comments.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {item.comments.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl text-xs border ${
                        c.is_admin
                          ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60"
                          : "bg-white dark:bg-[#0d121f] border-slate-200/80 dark:border-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`font-bold flex items-center gap-1 ${c.is_admin ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200"}`}>
                          {c.is_admin && <ShieldCheck className="w-3.5 h-3.5" />}
                          {c.author_name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{c.created_at}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{c.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">No community comments yet.</p>
              )}

              {/* Admin Comment Form */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Reply as Admin..."
                  value={adminCommentText}
                  onChange={(e) => setAdminCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCommentSubmit();
                  }}
                  className="flex-1 bg-white dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleCommentSubmit}
                  disabled={postingComment || !adminCommentText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function FeedbackInbox() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      let url = `${API_URL}/feedback/admin/list?status=${filter}`;
      if (channelFilter !== "all") {
        url += `&category=${channelFilter}`;
      }
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
  }, [filter, channelFilter]);

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

  const handleAddAdminComment = async (id: number, commentText: string) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/feedback/admin/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: commentText }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setItems((prev) =>
          prev.map((f) => {
            if (f.id === id) {
              const updatedComments = [...(f.comments || []), newComment];
              return {
                ...f,
                comments: updatedComments,
                comments_count: updatedComments.length,
              };
            }
            return f;
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const counts: Record<string, number> = {
    all: items.length,
    under_review: items.filter((f) => normalizeFeedbackStatus(f.status) === "under_review").length,
    in_progress: items.filter((f) => normalizeFeedbackStatus(f.status) === "in_progress").length,
    live: items.filter((f) => normalizeFeedbackStatus(f.status) === "live").length,
    on_hold: items.filter((f) => normalizeFeedbackStatus(f.status) === "on_hold").length,
  };

  const statusTabLabels: Record<string, string> = {
    all: "All",
    under_review: "🟡 Under Review",
    in_progress: "🔵 In Progress",
    live: "🟢 Live / Done",
    on_hold: "⏸️ On Hold",
  };

  const visibleItems = items
    .filter((f) => {
      if (filter === "all") return true;
      return normalizeFeedbackStatus(f.status) === filter;
    })
    .sort((a, b) => {
      const isLiveA = normalizeFeedbackStatus(a.status) === "live" ? 1 : 0;
      const isLiveB = normalizeFeedbackStatus(b.status) === "live" ? 1 : 0;
      if (isLiveA !== isLiveB) return isLiveA - isLiveB;

      const aTs = a.created_at_iso ? new Date(a.created_at_iso).getTime() : 0;
      const bTs = b.created_at_iso ? new Date(b.created_at_iso).getTime() : 0;
      return bTs - aTs;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Feedback & Suggestions Inbox
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              User appreciations, feature requests, criticisms, and bug reports
            </p>
          </div>
        </div>
        <button
          onClick={fetchFeedback}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] hover:border-indigo-500/40 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Inbox
        </button>
      </div>

      {/* Main Channel Switcher Tabs */}
      <div className="flex gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-3 overflow-x-auto">
        {[
          { id: "all", label: "All Channels" },
          { id: "suggestion", label: "💡 Suggestions" },
          { id: "feedback", label: "💬 Feedback & Experience" },
        ].map((ch) => (
          <button
            key={ch.id}
            onClick={() => setChannelFilter(ch.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              channelFilter === ch.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {ch.label}
          </button>
        ))}
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              filter === key
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {statusTabLabels[key] || key}{" "}
            {count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filter === key
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-white/[0.1] text-slate-600 dark:text-slate-300"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="text-slate-400 text-center py-12 text-sm font-medium">
          Loading feedback messages...
        </div>
      ) : visibleItems.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            icon={MessageCircle}
            title="No feedback found in this filter"
            description="When users submit feedback or suggestions in Arthavi, they will show up here for triaging."
          />
        </Card>
      ) : (
        <div className="space-y-3.5">
          {visibleItems.map((item) => (
            <FeedbackCard
              key={item.id}
              item={item}
              updating={updating === item.id}
              onUpdate={updateFeedbackData}
              onAddComment={handleAddAdminComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
