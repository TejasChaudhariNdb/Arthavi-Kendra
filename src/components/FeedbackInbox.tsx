"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Paperclip,
  FileText,
  Image as ImageIcon,
  Download,
  Maximize2,
  X,
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

// BUG-019: same-origin proxy adds the HttpOnly admin token on the server.
const API_URL = "/api/proxy";

// The token is no longer readable in the browser; the proxy adds it.
function getToken() {
  return "";
}

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(filename?: string | null, mimeType?: string | null) {
  if (mimeType && mimeType.startsWith("image/")) return true;
  if (!filename) return false;
  const ext = filename.split(".").pop()?.toLowerCase();
  return ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext || "");
}

function getAttachmentFullUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_URL}${url}`;
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
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  attachment_size?: number | null;
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

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
      className={`p-4 sm:p-5 transition-all ${
        item.status === "new"
          ? "border-indigo-400 dark:border-indigo-500/40 shadow-sm"
          : "border-slate-200/80 dark:border-white/[0.08]"
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Badges row: wraps on small screens so the text below gets full width */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
              item.main_category === "feedback"
                ? "text-pink-700 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800"
                : "text-amber-700 dark:text-yellow-400 bg-amber-50 dark:bg-yellow-950/40 border-amber-200 dark:border-yellow-800"
            }`}
          >
            {item.main_category === "feedback" ? "Feedback" : "Suggestion"}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-semibold ${typeCfg.color}`}>
            <TypeIcon className="w-3 h-3" />
            {typeCfg.label}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-semibold ${statusCfg.badgeColor}`}>
            <StatusIcon className="w-3 h-3" />
            {statusCfg.label}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${ageCls}`}>{ageLabel}</span>
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <div className="min-w-0">
              <h3 className="text-slate-900 dark:text-white font-bold text-[15px] sm:text-base leading-snug break-words">
                {item.title}
              </h3>
              {item.body && (
                <p className="text-slate-700 dark:text-slate-300 text-sm mt-1.5 leading-relaxed whitespace-pre-wrap break-words">
                  {item.body}
                </p>
              )}

              {item.attachment_url && (
                <div className="mt-2.5">
                  {isImageFile(item.attachment_name, item.attachment_type) ? (
                    <div className="inline-block max-w-full">
                      <div
                        onClick={() => setLightboxOpen(true)}
                        className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#070a13] max-w-xs"
                      >
                        <img
                          src={getAttachmentFullUrl(item.attachment_url)}
                          alt={item.attachment_name || "Attachment"}
                          className="max-h-36 w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Enlarge</span>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <ImageIcon className="w-3 h-3 text-indigo-500" />
                        <span className="truncate max-w-[200px]">{item.attachment_name || "Image"}</span>
                        {item.attachment_size ? <span>• {formatBytes(item.attachment_size)}</span> : null}
                      </div>

                      {/* Lightbox Modal */}
                      {lightboxOpen && (
                        <div
                          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                          onClick={() => setLightboxOpen(false)}
                        >
                          <div
                            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="w-full flex items-center justify-between pb-3 text-white px-1">
                              <span className="text-sm font-bold truncate max-w-[70vw]">
                                {item.attachment_name || item.title}
                              </span>
                              <div className="flex items-center gap-3">
                                <a
                                  href={getAttachmentFullUrl(item.attachment_url)}
                                  download={item.attachment_name || "attachment"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer flex items-center gap-1 text-xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download</span>
                                </a>
                                <button
                                  onClick={() => setLightboxOpen(false)}
                                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <img
                              src={getAttachmentFullUrl(item.attachment_url)}
                              alt={item.title}
                              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      href={getAttachmentFullUrl(item.attachment_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={item.attachment_name || true}
                      className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/40 text-xs font-semibold text-slate-800 dark:text-slate-200 transition group cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="truncate max-w-[200px] sm:max-w-[260px] text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {item.attachment_name || "Attached Document"}
                        </span>
                        {item.attachment_size ? (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                            {formatBytes(item.attachment_size)}
                          </span>
                        ) : null}
                      </div>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0 ml-1" />
                    </a>
                  )}
                </div>
              )}
              <div className="flex items-center gap-x-2 gap-y-1.5 mt-2.5 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                <span className="min-w-0 break-all">
                  {item.user ? (
                    <span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">#{item.user.id}</span>{" "}
                      {item.user.full_name || item.user.email}
                    </span>
                  ) : (
                    "Anonymous"
                  )}
                </span>
                <span aria-hidden>•</span>
                <span className="whitespace-nowrap">{item.created_at}</span>
                {item.agree_count && item.agree_count > 0 ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
                    <ThumbsUp className="w-3 h-3" /> {item.agree_count} agree
                  </span>
                ) : null}
                {item.user?.id && (
                  <Link
                    href={`/users/${item.user.id}`}
                    className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center gap-1 font-semibold"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open user
                  </Link>
                )}
              </div>
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
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed break-words whitespace-pre-wrap">{c.comment}</p>
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

const PAGE_SIZE = 20;

// Under Review first: it's what needs triage.
const STATUS_TABS: { key: string; label: string }[] = [
  { key: "under_review", label: "🟡 Under Review" },
  { key: "in_progress", label: "🔵 In Progress" },
  { key: "on_hold", label: "⏸️ On Hold" },
  { key: "live", label: "🟢 Live / Done" },
  { key: "all", label: "All" },
];

const EMPTY_COUNTS: Record<string, number> = {
  all: 0,
  under_review: 0,
  in_progress: 0,
  live: 0,
  on_hold: 0,
};

interface FeedbackPage {
  items: FeedbackItem[];
  total: number;
  counts: Record<string, number>;
  has_more: boolean;
}

export default function FeedbackInbox() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>(EMPTY_COUNTS);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("under_review");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<number | null>(null);
  // Ignore responses from a filter the user has already moved away from.
  const requestSeq = useRef(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(
    async (skip: number): Promise<FeedbackPage | null> => {
      const params = new URLSearchParams({
        status: filter,
        skip: String(skip),
        limit: String(PAGE_SIZE),
        paged: "true",
      });
      if (channelFilter !== "all") params.set("category", channelFilter);
      const res = await fetch(`${API_URL}/feedback/admin/list?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Failed to load feedback (${res.status})`);
      const data = await res.json();
      // Older backend: plain list, no paging or counts.
      if (Array.isArray(data)) {
        return { items: data, total: data.length, counts: { ...EMPTY_COUNTS, all: data.length }, has_more: false };
      }
      return data as FeedbackPage;
    },
    [filter, channelFilter]
  );

  const loadFirstPage = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    try {
      const page = await fetchPage(0);
      if (seq !== requestSeq.current || !page) return;
      setItems(page.items);
      setCounts({ ...EMPTY_COUNTS, ...page.counts });
      setHasMore(page.has_more);
    } catch (e) {
      if (seq === requestSeq.current) setError(e instanceof Error ? e.message : "Failed to load feedback");
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore) return;
    const seq = requestSeq.current;
    setLoadingMore(true);
    try {
      const page = await fetchPage(items.length);
      if (seq !== requestSeq.current || !page) return;
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...page.items.filter((p) => !seen.has(p.id))];
      });
      setCounts({ ...EMPTY_COUNTS, ...page.counts });
      setHasMore(page.has_more);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, items.length, hasMore, loading, loadingMore]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  // Auto-load the next page when the bottom of the list scrolls into view.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadMore]);

  const updateFeedbackData = async (id: number, status: string, action_taken: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`${API_URL}/feedback/admin/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status, action_taken }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      const before = items.find((f) => f.id === id);
      const oldKey = normalizeFeedbackStatus(before?.status);
      const newKey = normalizeFeedbackStatus(status);
      if (before && oldKey !== newKey) {
        setCounts((c) => ({ ...c, [oldKey]: Math.max(0, (c[oldKey] || 0) - 1), [newKey]: (c[newKey] || 0) + 1 }));
      }
      // Stays visible until the next refresh even if it no longer matches the tab,
      // so the admin can still see what they just changed.
      setItems((prev) => prev.map((f) => (f.id === id ? { ...f, status, action_taken } : f)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setUpdating(null);
    }
  };

  const handleAddAdminComment = async (id: number, commentText: string) => {
    try {
      const res = await fetch(`${API_URL}/feedback/admin/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ comment: commentText }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setItems((prev) =>
          prev.map((f) => {
            if (f.id === id) {
              const updatedComments = [...(f.comments || []), newComment];
              return { ...f, comments: updatedComments, comments_count: updatedComments.length };
            }
            return f;
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const shownTotal = filter === "all" ? counts.all : counts[filter] || 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Feedback Inbox
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {counts.under_review > 0
                ? `${counts.under_review} waiting for review`
                : "Nothing waiting for review"}
            </p>
          </div>
        </div>
        <button
          onClick={loadFirstPage}
          aria-label="Refresh inbox"
          className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] hover:border-indigo-500/40 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Channel tabs (scroll sideways on small screens) */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { id: "all", label: "All channels" },
          { id: "suggestion", label: "💡 Suggestions" },
          { id: "feedback", label: "💬 Feedback" },
        ].map((ch) => (
          <button
            key={ch.id}
            onClick={() => setChannelFilter(ch.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              channelFilter === ch.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {ch.label}
          </button>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-slate-200/80 dark:border-white/[0.08]">
        {STATUS_TABS.map(({ key, label }) => {
          const count = counts[key] || 0;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`shrink-0 mb-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                filter === key
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {label}
              <span
                className={`text-[10px] px-1.5 rounded-full font-bold ${
                  filter === key
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-white/[0.1] text-slate-600 dark:text-slate-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback list */}
      {loading && items.length === 0 ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-slate-100 dark:bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-6 text-center text-sm text-rose-600 dark:text-rose-400">
          {error}{" "}
          <button onClick={loadFirstPage} className="underline font-semibold cursor-pointer">
            Retry
          </button>
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            icon={MessageCircle}
            title="No feedback found in this filter"
            description="When users submit feedback or suggestions in Arthavi, they will show up here for triaging."
          />
        </Card>
      ) : (
        <div className={`space-y-3.5 ${loading ? "opacity-60" : ""}`}>
          {items.map((item) => (
            <FeedbackCard
              key={item.id}
              item={item}
              updating={updating === item.id}
              onUpdate={updateFeedbackData}
              onAddComment={handleAddAdminComment}
            />
          ))}

          <div ref={sentinelRef} />
          <div className="flex flex-col items-center gap-2 pt-2 pb-6 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing {items.length} of {shownTotal}
            </span>
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-4 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500/40 disabled:opacity-60 cursor-pointer"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
