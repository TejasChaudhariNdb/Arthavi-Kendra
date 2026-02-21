import { fetchChats } from "@/lib/api";
import { MessageSquare } from "lucide-react";
import ChatInbox from "@/components/ChatInbox";

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
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <MessageSquare className="text-emerald-500" /> AI Chat Inbox
        </h1>
        <p className="text-gray-400 mt-1">
          Click any session to read the full conversation inline.
        </p>
      </header>

      <ChatInbox initialSessions={chats} />
    </div>
  );
}
