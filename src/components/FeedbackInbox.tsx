"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bug,
  Lightbulb,
  MessageCircle,
  Clock,
  RefreshCw,
  Heart,
  AlertTriangle,
  Sparkles,
  Send,
  MessageSquare,
  ThumbsUp,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Download,
  Maximize2,
  X,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import {
  FEEDBACK_STATUSES,
  getFeedbackStatusMeta,
  normalizeFeedbackStatus,
  FeedbackStatus,
} from "@/lib/feedbackStatus";
import { Card } from "@/components/ui/Card";
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
  onAddComment: (id: number, commentText: string) => Promise<string | null>;
}

function initials(name?: string | null) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function AttachmentPreview({ item }: { item: FeedbackItem }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  if (!item.attachment_url) return null;
  const url = getAttachmentFullUrl(item.attachment_url);

  if (!isImageFile(item.attachment_name, item.attachment_type)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        download={item.attachment_name || true}
        className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/40 text-xs transition group"
      >
        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span className="truncate max-w-[220px] font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
          {item.attachment_name || "Attached document"}
        </span>
        {item.attachment_size ? <span className="text-slate-400">{formatBytes(item.attachment_size)}</span> : null}
        <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative block overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#070a13] max-w-xs cursor-zoom-in"
        aria-label="Enlarge attachment"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- signed backend URL, not optimizable */}
        <img src={url} alt={item.attachment_name || "Attachment"} className="max-h-36 w-full object-cover" loading="lazy" />
        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
          <Maximize2 className="w-3.5 h-3.5" /> Enlarge
        </span>
      </button>
      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <ImageIcon className="w-3 h-3 text-indigo-500" />
        <span className="truncate max-w-[200px]">{item.attachment_name || "Image"}</span>
        {item.attachment_size ? <span>· {formatBytes(item.attachment_size)}</span> : null}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between pb-3 text-white px-1">
              <span className="text-sm font-bold truncate max-w-[70vw]">{item.attachment_name || item.title}</span>
              <div className="flex items-center gap-3">
                <a
                  href={url}
                  download={item.attachment_name || "attachment"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- signed backend URL, not optimizable */}
            <img src={url} alt={item.title} className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10" />
          </div>
        </div>
      )}
    </>
  );
}

function FeedbackCard({ item, updating, onUpdate, onAddComment }: FeedbackCardProps) {
  const [status, setStatus] = useState(normalizeFeedbackStatus(item.status));
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [sentNote, setSentNote] = useState("");

  useEffect(() => {
    setStatus(normalizeFeedbackStatus(item.status));
  }, [item]);

  const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.feedback;
  const statusCfg = getFeedbackStatusMeta(item.status);
  const TypeIcon = typeCfg.icon;
  const StatusIcon = statusCfg.icon;
  const isSuggestion = item.main_category !== "feedback";
  const comments = item.comments || [];
  const replied = !!item.action_taken || comments.some((c) => c.is_admin);
  const userName = item.user ? item.user.full_name || item.user.email : "Anonymous";

  const created = item.created_at_iso ? new Date(item.created_at_iso) : null;
  let ageLabel = "";
  let ageCls = "";
  if (created && !Number.isNaN(created.getTime())) {
    const ageHours = (Date.now() - created.getTime()) / 36e5;
    if (ageHours < 24) {
      ageLabel = "Today";
      ageCls = "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30";
    } else {
      const days = Math.floor(ageHours / 24);
      ageLabel = `${days} ${days === 1 ? "day" : "days"} old`;
      // 1-3 days green, 4-7 amber, over 7 red
      ageCls =
        days <= 3
          ? "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30"
          : days <= 7
            ? "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30"
            : "text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-900/30";
    }
  }

  const sendReply = async () => {
    const text = replyText.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const emailedTo = await onAddComment(item.id, text);
      setReplyText("");
      setSentNote(emailedTo ? `Sent and emailed to ${emailedTo}` : "Sent (user has no email on file)");
    } catch {
      // parent already alerted; keep the text so nothing is lost
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="p-0 overflow-hidden border-slate-200/80 dark:border-white/[0.08]">
      <div className="flex">
        {/* Status accent for quick scanning */}
        <div className={`w-1 shrink-0 ${statusCfg.dot}`} aria-hidden />

        <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col gap-4">
          {/* Who + when */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">
                {initials(item.user?.full_name || item.user?.email)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  {item.user?.id ? (
                    <Link
                      href={`/users/${item.user.id}`}
                      className="font-semibold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                      title="Open user"
                    >
                      {userName}
                    </Link>
                  ) : (
                    <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">{userName}</span>
                  )}
                  {item.user?.id && <span className="text-xs text-slate-400 shrink-0">User #{item.user.id}</span>}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-1.5">
                  <span className="font-mono">Ticket #{item.id}</span>
                  <span aria-hidden>·</span>
                  <span>{item.created_at}</span>
                </div>
              </div>
            </div>
            {ageLabel && (
              <span className={`shrink-0 text-[11px] px-2 py-0.5 rounded-full font-semibold ${ageCls}`}>{ageLabel}</span>
            )}
          </div>

          {/* What */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${statusCfg.badgeColor}`}>
                <StatusIcon className="w-3 h-3" />
                {statusCfg.label}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-300 dark:bg-white/[0.04] dark:border-white/10">
                {isSuggestion ? "Suggestion" : "Feedback"}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${typeCfg.color}`}>
                <TypeIcon className="w-3 h-3" />
                {typeCfg.label}
              </span>
              {!!item.agree_count && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30">
                  <ThumbsUp className="w-3 h-3" /> {item.agree_count} agree
                </span>
              )}
              {!replied && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-900/30">
                  Not replied
                </span>
              )}
            </div>
            <h3 className="text-slate-900 dark:text-white font-semibold text-base leading-snug break-words">{item.title}</h3>
            {item.body && (
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 leading-relaxed whitespace-pre-wrap break-words">
                {item.body}
              </p>
            )}
            {item.attachment_url && (
              <div className="mt-3">
                <AttachmentPreview item={item} />
              </div>
            )}
          </div>

          {/* Conversation */}
          {(item.action_taken || comments.length > 0) && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {item.action_taken && (
                <ThreadMessage author="Official response" isAdmin text={item.action_taken} />
              )}
              {comments.map((c) => (
                <ThreadMessage key={c.id} author={c.author_name} isAdmin={c.is_admin} text={c.comment} time={c.created_at} />
              ))}
            </div>
          )}

          {/* One reply box: saved on the ticket and emailed to the user */}
          <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/15 transition">
            <textarea
              rows={2}
              placeholder={item.user?.email ? `Reply to ${userName}…` : "Reply…"}
              value={replyText}
              onChange={(e) => {
                setReplyText(e.target.value);
                if (sentNote) setSentNote("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendReply();
              }}
              className="w-full resize-y bg-transparent px-3.5 pt-3 pb-1 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-2.5">
              <div className="flex items-center gap-2">
                <select
                  value={status}
                  disabled={updating}
                  aria-label="Ticket status"
                  onChange={(e) => {
                    const next = e.target.value as FeedbackStatus;
                    setStatus(next);
                    onUpdate(item.id, next, item.action_taken || "");
                  }}
                  className="bg-white dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {FEEDBACK_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {updating ? "Saving status…" : item.user?.email ? `Replies are emailed to ${item.user.email}` : "No email on file"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {sentNote && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {sentNote}
                  </span>
                )}
                <button
                  onClick={sendReply}
                  disabled={sending || !replyText.trim()}
                  title="Send (Ctrl/Cmd + Enter)"
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs px-4 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sending ? "Sending…" : "Send reply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ThreadMessage({ author, isAdmin, text, time }: { author: string; isAdmin: boolean; text: string; time?: string }) {
  return (
    <div
      className={`p-3 rounded-xl text-sm border ${
        isAdmin
          ? "bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-800/50 ml-8"
          : "bg-white dark:bg-[#0d121f] border-slate-200/80 dark:border-white/[0.06] mr-8"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className={`text-xs font-semibold flex items-center gap-1 ${isAdmin ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-200"}`}>
          {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
          {author}
        </span>
        {time && <span className="text-[11px] text-slate-400">{time}</span>}
      </div>
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed break-words whitespace-pre-wrap">{text}</p>
    </div>
  );
}

const PAGE_SIZE = 20;

// Under Review first: it's what needs triage.
const STATUS_TABS: { key: string; label: string; dot?: string }[] = [
  { key: "under_review", label: "Under Review", dot: "bg-amber-500" },
  { key: "in_progress", label: "In Progress", dot: "bg-blue-500" },
  { key: "on_hold", label: "On Hold", dot: "bg-slate-400" },
  { key: "live", label: "Live / Done", dot: "bg-emerald-500" },
  { key: "all", label: "All" },
];

const CHANNELS = [
  { id: "all", label: "All" },
  { id: "suggestion", label: "Suggestions" },
  { id: "feedback", label: "Feedback" },
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
      if (!res.ok) throw new Error(`Reply failed (${res.status})`);
      const newComment = await res.json();
      setItems((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          const updatedComments = [...(f.comments || []), newComment];
          return { ...f, comments: updatedComments, comments_count: updatedComments.length };
        })
      );
      return (newComment.emailed_to as string | null) ?? null;
    } catch (e) {
      alert(e instanceof Error ? e.message : "Reply failed");
      throw e;
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

      {/* Toolbar: status tabs (left) + channel switch (right) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
        <div className="flex gap-1 overflow-x-auto -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist">
          {STATUS_TABS.map(({ key, label, dot }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(key)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  active
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {dot && <span className={`w-2 h-2 rounded-full ${dot}`} aria-hidden />}
                {label}
                <span
                  className={`text-[10px] min-w-5 px-1.5 py-px rounded-full font-bold tabular-nums ${
                    active ? "bg-white/20 dark:bg-slate-900/10" : "bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-slate-300"
                  }`}
                >
                  {counts[key] || 0}
                </span>
              </button>
            );
          })}
        </div>
        <div className="inline-flex self-start lg:self-auto p-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.05]">
          {CHANNELS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setChannelFilter(ch.id)}
              aria-pressed={channelFilter === ch.id}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                channelFilter === ch.id
                  ? "bg-white dark:bg-[#1a2033] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
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
        <div className={`space-y-4 ${loading ? "opacity-60" : ""}`}>
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
