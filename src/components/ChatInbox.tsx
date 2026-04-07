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
    <div className="flex h-[calc(100vh-120px)] rounded-xl overflow-hidden border border-gray-800">
      {/* ── LEFT PANEL: Session list ── */}
      {/* On mobile: visible only when no session selected */}
      {/* On desktop: always visible as 320px sidebar */}
      <div
        className={`bg-gray-950 border-r border-gray-800 flex flex-col
          ${selected ? "hidden md:flex" : "flex w-full"}
          md:w-80 md:shrink-0`}>
        {/* Search bar */}
        <div className="p-3 border-b border-gray-800">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={14}
            />
            <input
              type="text"
              placeholder="Search sessions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-600 transition-colors"
            />
          </div>
        </div>

        {/* Session rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-800/50">
          {filtered.map((s) => {
            const isActive = selected?.session.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => loadMessages(s.id)}
                className={`w-full text-left p-4 transition-colors hover:bg-gray-900 border-l-2 ${
                  isActive
                    ? "bg-emerald-900/20 border-emerald-500"
                    : "border-transparent"
                }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {s.title || "Untitled"}
                    </p>
                    <p className="text-xs text-emerald-400 truncate mt-0.5">
                      {s.user?.name || s.user?.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {s.preview}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-600 shrink-0 mt-0.5">
                    {s.updated_at?.split(" ")[0]}
                  </span>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-6 text-center text-gray-600 text-sm">
              No sessions found
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-800 text-xs text-gray-600 text-center">
          {sessions.length} total sessions
        </div>
      </div>

      {/* ── RIGHT PANEL: Conversation viewer ── */}
      {/* On mobile: visible only when a session is selected */}
      {/* On desktop: always visible, fills remaining space */}
      <div
        className={`flex-1 flex flex-col bg-gray-900 min-w-0
          ${selected ? "flex w-full" : "hidden md:flex"}`}>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <RefreshCw className="animate-spin text-gray-500" size={24} />
          </div>
        ) : selected ? (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-800 bg-gray-950 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {/* Back button — mobile only */}
                <button
                  onClick={() => setSelected(null)}
                  className="md:hidden p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors shrink-0">
                  <ChevronLeft size={18} />
                </button>
                <div className="min-w-0">
                  <h2 className="text-white font-semibold text-sm truncate">
                    {selected.session.title || "Untitled Session"}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-xs text-emerald-400 font-medium">
                      {selected.session.user.name ||
                        selected.session.user.email}
                    </span>
                    <span className="text-gray-600 text-xs hidden sm:inline">
                      •
                    </span>
                    <span className="text-xs text-gray-500 hidden sm:inline">
                      {selected.session.updated_at}
                    </span>
                    <span className="text-gray-600 text-xs">•</span>
                    <span className="text-xs text-gray-500">
                      {selected.messages.length} msgs
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/users/${selected.session.user.id}`}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg shrink-0 transition-colors">
                <ExternalLink size={12} />
                <span className="hidden sm:inline">View User</span>
              </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selected.messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                      m.role === "user"
                        ? "bg-blue-900/50 text-blue-400"
                        : "bg-emerald-900/50 text-emerald-400"
                    }`}>
                    {m.role === "user" ? (
                      <UserIcon size={13} />
                    ) : (
                      <Bot size={13} />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      m.role === "user"
                        ? "bg-blue-900/30 text-blue-100 rounded-tr-none"
                        : "bg-gray-800 text-gray-100 rounded-tl-none"
                    }`}>
                    <div className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                    <p
                      className={`text-[10px] mt-1 ${
                        m.role === "user"
                          ? "text-blue-400/50 text-right"
                          : "text-gray-500"
                      }`}>
                      {m.created_at}
                    </p>
                  </div>
                </div>
              ))}

              {selected.messages.length === 0 && (
                <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
                  No messages in this session.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-3">
            <MessageSquare size={40} className="opacity-20" />
            <p className="text-sm">Select a conversation to read</p>
          </div>
        )}
      </div>
    </div>
  );
}
