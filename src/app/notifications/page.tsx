"use client";

import { useState } from "react";
import { sendNotification } from "@/lib/auth-client";
import { Bell, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetType, setTargetType] = useState<"all" | "specific">("all");
  const [userIdsStr, setUserIdsStr] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setLoading(true);
    setStatus({ type: "idle", message: "" });

    try {
      const data: any = {
        title,
        body,
        send_to_all: targetType === "all",
      };

      if (targetType === "specific") {
        if (!userIdsStr.trim()) {
          setStatus({
            type: "error",
            message: "Please enter at least one user ID.",
          });
          setLoading(false);
          return;
        }

        // Parse comma separated IDs
        const ids = userIdsStr
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id !== "")
          .map((id) => parseInt(id, 10));

        if (ids.some(isNaN)) {
          setStatus({
            type: "error",
            message:
              "Invalid User IDs format. Please use comma-separated numbers.",
          });
          setLoading(false);
          return;
        }

        data.user_ids = ids;
      }

      const res = await sendNotification(data);
      setStatus({
        type: "success",
        message: res.message || "Notification sent!",
      });
      setTitle("");
      setBody("");
      setUserIdsStr("");
    } catch (e: any) {
      setStatus({
        type: "error",
        message: e.message || "Failed to send notification",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <Bell className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Push Notifications
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Compose Message
          </h2>

          <form onSubmit={handleSend} className="space-y-5">
            {status.type !== "idle" && (
              <div
                className={`flex gap-3 p-4 rounded-lg text-sm border ${
                  status.type === "success"
                    ? "bg-emerald-900/20 border-emerald-900/50 text-emerald-400"
                    : "bg-red-900/20 border-red-900/50 text-red-400"
                }`}>
                {status.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Target Audience
              </label>
              <div className="flex bg-gray-950 border border-gray-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setTargetType("all")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    targetType === "all"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}>
                  All Users
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType("specific")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    targetType === "specific"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}>
                  Specific Users
                </button>
              </div>
            </div>

            {targetType === "specific" && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">
                  User IDs (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1, 4, 15"
                  value={userIdsStr}
                  onChange={(e) => setUserIdsStr(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get User IDs from the Users tab.
                </p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-400">Title</label>
              <input
                type="text"
                required
                placeholder="Check out the new feature!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={65}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <div className="text-right text-xs text-gray-500">
                {title.length}/65
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-400">
                Message Body
              </label>
              <textarea
                required
                placeholder="We just added mutual funds..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={240}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
              <div className="text-right text-xs text-gray-500">
                {body.length}/240
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors mt-2">
              {loading ? "Sending..." : "Send Notification"}
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Live Preview Area */}
        <div className="hidden md:block">
          <h2 className="text-xl font-semibold text-white mb-6">
            Preview on iOS
          </h2>
          <div className="relative w-[300px] h-[600px] bg-black border-[8px] border-gray-800 rounded-[3rem] shadow-2xl overflow-hidden pt-12">
            {/* iOS Notch */}
            <div className="absolute top-0 inset-x-0 h-7 bg-gray-800 rounded-b-3xl w-40 mx-auto"></div>

            {/* Wallpaper / Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-black z-0"></div>

            {/* Notification Bubble */}
            <div className="relative z-10 m-4 mt-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-lg transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-indigo-500 rounded-md shrink-0 flex items-center justify-center">
                  <Bell className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs text-white/50 font-medium tracking-wide uppercase">
                  Arthavi
                </span>
                <span className="text-xs text-white/30 ml-auto flex-shrink-0">
                  now
                </span>
              </div>
              <div className="text-white font-medium text-[15px] leading-tight mb-1 break-words">
                {title || "Notification Title"}
              </div>
              <div className="text-white/80 text-sm leading-snug line-clamp-2 break-words">
                {body ||
                  "This is how your message body will appear on a user's device. Make it catchy!"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
