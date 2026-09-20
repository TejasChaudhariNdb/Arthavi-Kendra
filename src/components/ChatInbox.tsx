"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Bot,
  User as UserIcon,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp("(^| )admin_token=([^;]+)"));
    if (match) return match[2];
  }
  return "";
}

interface ChatSession {
  id: number;
  title: string;
  updated_at: string;
  preview: string;
  user: { id: number; name: string; email: string };
}

interface ChatMessage {
  role: string;
  content: string;
  created_at: string;
}

interface SessionDetail {
  session: {
    id: number;
    title: string;
    updated_at: string;
    user: { id: number; name: string; email: string };
  };
  messages: ChatMessage[];
}

export default function ChatInbox({
  initialSessions,
  initialSelectedSessionId,
}: {
  initialSessions: ChatSession[];
  initialSelectedSessionId?: number | null;
}) {
  const [sessions] = useState<ChatSession[]>(initialSessions);
  const [selected, setSelected] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = sessions.filter(
    (s) =>
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const loadMessages = useCallback(async (sessionId: number) => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/chats/${sessionId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setSelected(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialSelectedSessionId) {
      void loadMessages(initialSelectedSessionId);
    }
  }, [initialSelectedSessionId, loadMessages]);

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0d121f] shadow-xs">
      {/* ── LEFT PANEL: Session list ── */}
      <div
        className={`bg-slate-50/50 dark:bg-white/[0.01] border-r border-slate-200/80 dark:border-white/[0.08] flex flex-col
          ${selected ? "hidden md:flex" : "flex w-full"}
          md:w-80 md:shrink-0`}>
        {/* Search bar */}
        <div className="p-3 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              size={14}
            />
            <input
              type="text"
              placeholder="Search sessions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#090d16] border border-slate-200 dark:border-white/[0.08] rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Session rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200/60 dark:divide-white/[0.05]">
          {filtered.map((s) => {
            const isActive = selected?.session.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => loadMessages(s.id)}
                className={`w-full text-left p-4 transition-colors hover:bg-slate-100/60 dark:hover:bg-white/[0.03] border-l-2 cursor-pointer ${
                  isActive
                    ? "bg-indigo-50/60 dark:bg-indigo-500/10 border-indigo-600 dark:border-indigo-500"
                    : "border-transparent"
                }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {s.title || "Untitled Session"}
                    </p>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 truncate mt-0.5 font-medium">
                      {s.user?.name || s.user?.email}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {s.preview}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 mt-0.5 font-mono">
                    {s.updated_at?.split(" ")[0]}
                  </span>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs">
              No sessions found
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-200/80 dark:border-white/[0.08] text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
          {sessions.length} total sessions
        </div>
      </div>

      {/* ── RIGHT PANEL: Conversation viewer ── */}
      <div
        className={`flex-1 flex flex-col bg-white dark:bg-[#0d121f] min-w-0
          ${selected ? "flex w-full" : "hidden md:flex"}`}>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <RefreshCw className="animate-spin text-indigo-500" size={24} />
          </div>
        ) : selected ? (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => setSelected(null)}
                  className="md:hidden p-1.5 hover:bg-slate-200 dark:hover:bg-white/[0.08] rounded-lg text-slate-500 dark:text-slate-400 transition-colors shrink-0">
                  <ChevronLeft size={18} />
                </button>
                <div className="min-w-0">
                  <h2 className="text-slate-900 dark:text-white font-semibold text-sm truncate">
                    {selected.session.title || "Untitled Session"}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-xs">
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                      {selected.session.user.name || selected.session.user.email}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                    <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
                      {selected.session.updated_at}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {selected.messages.length} msgs
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/users/${selected.session.user.id}`}
                className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] px-3 py-1.5 rounded-lg shrink-0 transition-colors font-medium">
                <ExternalLink size={12} />
                <span className="hidden sm:inline">View User</span>
              </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selected.messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                      m.role === "user"
                        ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400"
                        : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                    }`}>
                    {m.role === "user" ? (
                      <UserIcon size={13} />
                    ) : (
                      <Bot size={13} />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-xs"
                        : "bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 rounded-tl-none"
                    }`}>
                    <div className={`prose max-w-none text-xs leading-relaxed ${m.role === "user" ? "prose-invert text-white" : "dark:prose-invert"}`}>
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                    <p
                      className={`text-[10px] mt-1.5 ${
                        m.role === "user"
                          ? "text-indigo-200 text-right"
                          : "text-slate-400 dark:text-slate-500"
                      }`}>
                      {m.created_at}
                    </p>
                  </div>
                </div>
              ))}

              {selected.messages.length === 0 && (
                <div className="flex items-center justify-center h-40 text-slate-400 dark:text-slate-500 text-xs">
                  No messages in this session.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-3">
            <MessageSquare size={36} className="opacity-30" />
            <p className="text-xs font-medium">Select a conversation to read</p>
          </div>
        )}
      </div>
    </div>
  );
}
