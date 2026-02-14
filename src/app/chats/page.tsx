import { fetchChats } from "@/lib/api";
import {
  MessageSquare,
  User as UserIcon,
  Calendar,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ChatsPage() {
  let chats = [];
  try {
    chats = await fetchChats();
  } catch (e) {
    return (
      <div className="text-red-500">
        Error loading chats. {e instanceof Error ? e.message : "Unknown error"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <MessageSquare className="text-emerald-500" /> Global API Chat History
        </h1>
        <p className="text-gray-400 mt-2">
          Recent conversations between users and the AI Advisor.
        </p>
      </header>

      <div className="grid gap-4">
        {chats.length > 0 ? (
          chats.map((chat: any) => (
            <div
              key={chat.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-500/30 transition-all shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                {/* Left: Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium uppercase tracking-wide">
                    <UserIcon size={14} />
                    <Link
                      href={`/users/${chat.user.id}`}
                      className="hover:underline">
                      {chat.user.name}
                    </Link>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-500 normal-case">
                      {chat.user.email}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    {chat.title || "Untitled Session"}
                  </h3>

                  <div className="text-gray-400 text-sm line-clamp-2 italic border-l-2 border-gray-700 pl-3 py-1">
                    "{chat.preview}"
                  </div>
                </div>

                {/* Right: Meta & Action */}
                <div className="flex flex-col items-end justify-between min-w-[150px]">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={12} />
                    {chat.updated_at}
                  </div>

                  <Link
                    href={`/users/${chat.user.id}`}
                    className="flex items-center gap-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                    View Chat <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gray-900 rounded-xl border border-gray-800">
            No chat sessions found.
          </div>
        )}
      </div>
    </div>
  );
}
