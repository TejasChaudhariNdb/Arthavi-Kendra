import { fetchChats } from "@/lib/api";
import { MessageSquare, Bot, AlertCircle } from "lucide-react";
import ChatInbox from "@/components/ChatInbox";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function ChatsPage() {
  let chats = [];
  try {
    chats = await fetchChats();
  } catch (e) {
    return (
      <Card className="p-8 text-center border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
        <div className="flex flex-col items-center gap-2 text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm font-semibold">Error loading AI chat conversations</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{e instanceof Error ? e.message : "Unknown error"}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              AI Conversations &amp; Chat Inbox
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Inspect user conversations with Arthavi AI assistant and audit response quality
            </p>
          </div>
        </div>
      </div>

      <ChatInbox initialSessions={chats} />
    </div>
  );
}
