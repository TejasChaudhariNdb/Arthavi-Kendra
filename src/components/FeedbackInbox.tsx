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
  Heart,
  AlertTriangle,
  Sparkles,
  Send,
  MessageSquare,
  ThumbsUp,
  ShieldCheck,
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
  appreciation: {
    label: "Appreciation",
    icon: Heart,
    color: "text-pink-400 bg-pink-950/40 border-pink-800",
  },
  criticism: {
    label: "Area for Improvement",
    icon: AlertTriangle,
    color: "text-purple-400 bg-purple-950/40 border-purple-800",
  },
  data_mismatch: {
    label: "Data Mismatch",
    icon: AlertTriangle,
    color: "text-orange-400 bg-orange-950/40 border-orange-800",
  },
  delay: {
    label: "Response Delay",
    icon: Clock,
    color: "text-amber-400 bg-amber-950/40 border-amber-800",
  },
  bug: {
    label: "Bug Report",
    icon: Bug,
    color: "text-red-400 bg-red-950/40 border-red-800",
  },
  ui_ux: {
    label: "UI / UX Idea",
    icon: Sparkles,
    color: "text-indigo-400 bg-indigo-950/40 border-indigo-800",
  },
  idea: {
    label: "General Idea",
    icon: Lightbulb,
    color: "text-cyan-400 bg-cyan-950/40 border-cyan-800",
  },
  feature: {
    label: "Feature Request",
    icon: Lightbulb,
    color: "text-yellow-400 bg-yellow-950/40 border-yellow-800",
  },
  feedback: {
    label: "Feedback",
    icon: MessageCircle,
    color: "text-blue-400 bg-blue-950/40 border-blue-800",
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
    label: "Action Taken",
    color: "text-emerald-400 bg-emerald-900/30 border-emerald-800",
    icon: CheckCircle,
  },
  not_feasible: {
    label: "Shelved",
    color: "text-rose-400 bg-rose-900/30 border-rose-800",
    icon: CheckCircle,
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
  const [status, setStatus] = useState(item.status);
  const [actionTaken, setActionTaken] = useState(item.action_taken || "");
  const [isSaved, setIsSaved] = useState(true);
  const [adminCommentText, setAdminCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);

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
    <div
      className={`bg-gray-950 border rounded-xl p-5 transition-all ${
        item.status === "new" ? "border-red-900/50" : "border-gray-800"
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
                  ? "text-pink-400 bg-pink-950/40 border-pink-800"
                  : "text-yellow-400 bg-yellow-950/40 border-yellow-800"
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
              <h3 className="text-white font-semibold text-sm leading-snug truncate">
                {item.title}
              </h3>
              {item.body && (
                <p className="text-gray-400 text-sm mt-1 leading-relaxed whitespace-pre-wrap">
                  {item.body}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-gray-500">
                <span>
                  {item.user ? (
                    <span>
                      <span className="text-gray-400 font-medium">#{item.user.id}</span>{" "}
                      {item.user.full_name || item.user.email}
                    </span>
                  ) : (
                    "Anonymous"
                  )}
                </span>
                <span>•</span>
                <span>{item.created_at}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${ageCls}`}>
                  {ageLabel}
                </span>
                {item.agree_count && item.agree_count > 0 ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
                    <ThumbsUp className="w-3 h-3" /> {item.agree_count} agree
                  </span>
                ) : null}
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
              placeholder="Official Response / Action Taken Note..."
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
              <option value="resolved">Action Taken</option>
              <option value="not_feasible">Shelved</option>
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

        {/* Community Comments Thread Toggle */}
        <div className="border-t border-gray-900 pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 font-medium transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Community Comments ({item.comments?.length || 0})</span>
            </button>
          </div>

          {showComments && (
            <div className="mt-2 bg-gray-900/60 border border-gray-800/80 rounded-xl p-3 space-y-3">
              {item.comments && item.comments.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {item.comments.map((c) => (
                    <div
                      key={c.id}
                      className={`p-2.5 rounded-lg text-xs border ${
                        c.is_admin
                          ? "bg-emerald-950/30 border-emerald-800/60"
                          : "bg-gray-950 border-gray-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`font-bold flex items-center gap-1 ${c.is_admin ? "text-emerald-400" : "text-gray-300"}`}>
                          {c.is_admin && <ShieldCheck className="w-3 h-3" />}
                          {c.author_name}
                        </span>
                        <span className="text-[10px] text-gray-500">{c.created_at}</span>
                      </div>
                      <p className="text-gray-300">{c.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No community comments yet.</p>
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
                  className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-600"
                />
                <button
                  onClick={handleCommentSubmit}
                  disabled={postingComment || !adminCommentText.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition"
                >
                  <Send className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeedbackInbox() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all"); // "all", "suggestion", "feedback"
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
      return bTs - aTs; // newest first
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Feedback & Suggestions Inbox
          </h1>
          <p className="text-gray-400 mt-1">
            User appreciations, feature requests, criticisms, and bug reports
          </p>
        </div>
        <button
          onClick={fetchFeedback}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Main Channel Switcher Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-3">
        {[
          { id: "all", label: "All Channels" },
          { id: "suggestion", label: "💡 Suggestions" },
          { id: "feedback", label: "💬 Feedback & Experience" },
        ].map((ch) => (
          <button
            key={ch.id}
            onClick={() => setChannelFilter(ch.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              channelFilter === ch.id
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
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
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize flex items-center gap-1.5 ${
              filter === key
                ? "bg-gray-800 text-white border border-gray-600 font-bold"
                : "bg-gray-950 border border-gray-800 text-gray-400 hover:text-white"
            }`}>
            {key.replace("_", " ")}{" "}
            {count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${filter === key ? "bg-emerald-500 text-white font-bold" : "bg-gray-800"}`}>
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
          <p>No items found in this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
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
