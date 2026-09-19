"use client";

import { useState, useEffect } from "react";
import {
  sendNotification,
  fetchMailingListClient,
  fetchMailingListStatsClient,
  updateUserNotificationPreferencesClient,
} from "@/lib/auth-client";
import {
  Bell,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Users,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Copy,
  Check,
  Sliders,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Filter,
} from "lucide-react";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"push" | "mailing_list">("mailing_list");

  // Push broadcast state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetType, setTargetType] = useState<"all" | "specific">("all");
  const [userIdsStr, setUserIdsStr] = useState("");
  const [pushLoading, setPushLoading] = useState(false);
  const [pushStatus, setPushStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  // Mailing List state
  const [mailingList, setMailingList] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [listLoading, setListLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "subscribed" | "unsubscribed">("all");
  const [page, setPage] = useState(1);
  const [copiedTokenUserId, setCopiedTokenUserId] = useState<number | null>(null);

  // Edit / Unsubscribe Modal State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [actionModalType, setActionModalType] = useState<"unsubscribe" | "edit" | null>(null);
  const [unsubReason, setUnsubReason] = useState("User requested via WhatsApp / Support");
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const PAGE_SIZE = 25;

  useEffect(() => {
    if (activeTab === "mailing_list") {
      loadStats();
      loadMailingList();
    }
  }, [activeTab, page, statusFilter]);

  const loadStats = async () => {
    try {
      const data = await fetchMailingListStatsClient();
      setStats(data);
    } catch (e) {
      console.error("Failed to load stats", e);
    }
  };

  const loadMailingList = async (customSearch?: string) => {
    setListLoading(true);
    try {
      const term = customSearch !== undefined ? customSearch : searchQuery;
      const data = await fetchMailingListClient({
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        search: term || undefined,
        status_filter: statusFilter !== "all" ? statusFilter : undefined,
      });
      setMailingList(data.users || []);
      setTotalCount(data.total || 0);
    } catch (e) {
      console.error("Failed to load mailing list", e);
    } finally {
      setListLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadMailingList(searchQuery);
  };

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setPushLoading(true);
    setPushStatus({ type: "idle", message: "" });

    try {
      const data: any = {
        title,
        body,
        send_to_all: targetType === "all",
      };

      if (targetType === "specific") {
        if (!userIdsStr.trim()) {
          setPushStatus({
            type: "error",
            message: "Please enter at least one user ID.",
          });
          setPushLoading(false);
          return;
        }

        const ids = userIdsStr
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id !== "")
          .map((id) => parseInt(id, 10));

        if (ids.some(isNaN)) {
          setPushStatus({
            type: "error",
            message: "Invalid User IDs format. Please use comma-separated numbers.",
          });
          setPushLoading(false);
          return;
        }

        data.user_ids = ids;
      }

      const res = await sendNotification(data);
      setPushStatus({
        type: "success",
        message: res.message || "Notification sent!",
      });
      setTitle("");
      setBody("");
      setUserIdsStr("");
    } catch (e: any) {
      setPushStatus({
        type: "error",
        message: e.message || "Failed to send notification",
      });
    } finally {
      setPushLoading(false);
    }
  };

  const openUnsubscribeModal = (user: any) => {
    setEditingUser(user);
    setUnsubReason("User requested unsubscribe via WhatsApp / Email");
    setActionModalType("unsubscribe");
    setModalError(null);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditForm({ ...user.preferences });
    setActionModalType("edit");
    setModalError(null);
  };

  const handleConfirmUnsubscribe = async () => {
    if (!editingUser) return;
    setModalSaving(true);
    setModalError(null);
    try {
      await updateUserNotificationPreferencesClient(editingUser.user_id, {
        unsubscribed_all_marketing: true,
        unsubscribe_reason: unsubReason,
      });
      setActionModalType(null);
      loadStats();
      loadMailingList();
    } catch (err: any) {
      setModalError(err.message || "Failed to unsubscribe user");
    } finally {
      setModalSaving(false);
    }
  };

  const handleConfirmEdit = async () => {
    if (!editingUser) return;
    setModalSaving(true);
    setModalError(null);
    try {
      await updateUserNotificationPreferencesClient(editingUser.user_id, editForm);
      setActionModalType(null);
      loadStats();
      loadMailingList();
    } catch (err: any) {
      setModalError(err.message || "Failed to update preferences");
    } finally {
      setModalSaving(false);
    }
  };

  const handleQuickResubscribe = async (userId: number) => {
    try {
      await updateUserNotificationPreferencesClient(userId, {
        unsubscribed_all_marketing: false,
        email_daily_nudge: true,
        email_weekly_summary: true,
        email_product_updates: true,
        email_marketing: true,
      });
      loadStats();
      loadMailingList();
    } catch (err: any) {
      alert("Failed to resubscribe: " + err.message);
    }
  };

  const copyUnsubscribeLink = (token: string, userId: number) => {
    if (!token) return;
    const link = `https://app.arthavi.com/unsubscribe?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedTokenUserId(userId);
    setTimeout(() => setCopiedTokenUserId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl">
            <Mail className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Mailing List &amp; Notifications
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Production email suppression, preference engine &amp; push notification controls
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-gray-900 border border-gray-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("mailing_list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "mailing_list"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Mail size={16} />
            Mailing List &amp; Preferences
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("push")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "push"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Bell size={16} />
            Push Broadcast
          </button>
        </div>
      </div>

      {/* TAB 1: MAILING LIST & PREFERENCE ENGINE */}
      {activeTab === "mailing_list" && (
        <div className="space-y-6">
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Total Users</span>
                <Users size={16} className="text-gray-500" />
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {stats ? stats.total_users.toLocaleString() : "..."}
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-400">Active Subscribers</span>
                <UserCheck size={16} className="text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {stats ? stats.active_subscribers.toLocaleString() : "..."}
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-rose-400">Unsubscribed</span>
                <UserX size={16} className="text-rose-500" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-rose-400">
                  {stats ? stats.unsubscribed_count.toLocaleString() : "..."}
                </p>
                <span className="text-xs font-medium text-gray-500">
                  ({stats ? stats.unsubscribe_rate_pct : 0}%)
                </span>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-indigo-400">Push Opt-Ins</span>
                <Smartphone size={16} className="text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-indigo-300 mt-1">
                {stats ? stats.push_users_count.toLocaleString() : "..."}
              </p>
            </div>
          </div>

          {/* Search, Filter & Actions Bar */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
              <input
                type="text"
                placeholder="Search user by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 outline-hidden focus:border-indigo-500"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </form>

            {/* Filter Tabs & Refresh */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="flex bg-gray-950 border border-gray-800 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => { setStatusFilter("all"); setPage(1); }}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === "all"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  All Users
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter("subscribed"); setPage(1); }}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === "subscribed"
                      ? "bg-emerald-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Subscribed
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter("unsubscribed"); setPage(1); }}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === "unsubscribed"
                      ? "bg-rose-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Unsubscribed
                </button>
              </div>

              <button
                type="button"
                onClick={() => { loadStats(); loadMailingList(); }}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw size={15} className={listLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-950/70 text-xs font-semibold uppercase text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Mailing Status</th>
                    <th className="px-5 py-3.5">Active Channels</th>
                    <th className="px-5 py-3.5">Unsubscribed Info</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {listLoading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                        <RefreshCw size={24} className="animate-spin mx-auto text-indigo-400 mb-2" />
                        Loading mailing list...
                      </td>
                    </tr>
                  ) : mailingList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                        No users found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    mailingList.map((item) => {
                      const isUnsubscribed = item.preferences.unsubscribed_all_marketing;
                      return (
                        <tr key={item.user_id} className="hover:bg-gray-850/40 transition-colors">
                          {/* User info */}
                          <td className="px-5 py-3.5">
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                {item.full_name}
                                {!item.is_active && (
                                  <span className="text-[10px] bg-red-950/60 border border-red-900/60 text-red-400 px-1.5 py-0.2 rounded font-normal">
                                    Deactivated
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 font-mono mt-0.5">
                                {item.email}
                              </div>
                              <div className="text-[11px] text-gray-500 mt-0.5">
                                ID: {item.user_id} · Joined {item.created_at}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5">
                            {isUnsubscribed ? (
                              <span className="inline-flex items-center gap-1 bg-rose-950/50 border border-rose-800/40 text-rose-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                                <UserX size={12} /> Unsubscribed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-950/50 border border-emerald-800/40 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                                <UserCheck size={12} /> Active Subscriber
                              </span>
                            )}
                          </td>

                          {/* Active Channels */}
                          <td className="px-5 py-3.5">
                            <div className="flex flex-wrap gap-1.5">
                              {item.preferences.email_daily_nudge && !isUnsubscribed && (
                                <span className="text-[10px] bg-indigo-950/70 border border-indigo-800/40 text-indigo-300 px-2 py-0.5 rounded-md font-medium">
                                  🌅 Daily Nudge
                                </span>
                              )}
                              {item.preferences.email_weekly_summary && !isUnsubscribed && (
                                <span className="text-[10px] bg-emerald-950/70 border border-emerald-800/40 text-emerald-300 px-2 py-0.5 rounded-md font-medium">
                                  📊 Weekly Summary
                                </span>
                              )}
                              {item.preferences.email_product_updates && !isUnsubscribed && (
                                <span className="text-[10px] bg-purple-950/70 border border-purple-800/40 text-purple-300 px-2 py-0.5 rounded-md font-medium">
                                  🚀 Product Updates
                                </span>
                              )}
                              {item.has_push_token && (
                                <span className="text-[10px] bg-sky-950/70 border border-sky-800/40 text-sky-300 px-2 py-0.5 rounded-md font-medium">
                                  📱 Push Token
                                </span>
                              )}
                              {isUnsubscribed && (
                                <span className="text-[10px] text-gray-500 italic">
                                  All marketing digests paused
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Unsubscribed info */}
                          <td className="px-5 py-3.5 text-xs text-gray-400">
                            {isUnsubscribed ? (
                              <div>
                                <p className="text-gray-300 font-medium">
                                  {item.preferences.unsubscribed_at || "Recent"}
                                </p>
                                <p className="text-gray-500 italic text-[11px] mt-0.5 max-w-xs truncate" title={item.preferences.unsubscribe_reason}>
                                  Reason: {item.preferences.unsubscribe_reason || "Not specified"}
                                </p>
                              </div>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Copy 1-Click Unsubscribe Link */}
                              <button
                                type="button"
                                onClick={() => copyUnsubscribeLink(item.preferences.unsubscribe_token, item.user_id)}
                                className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Copy 1-Click Unsubscribe URL"
                              >
                                {copiedTokenUserId === item.user_id ? (
                                  <Check size={14} className="text-emerald-400" />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>

                              {/* Edit Toggles */}
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <Sliders size={12} /> Edit
                              </button>

                              {/* Toggle Unsubscribe */}
                              {isUnsubscribed ? (
                                <button
                                  type="button"
                                  onClick={() => handleQuickResubscribe(item.user_id)}
                                  className="px-2.5 py-1.5 bg-emerald-950/60 border border-emerald-800/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                >
                                  Resubscribe
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openUnsubscribeModal(item)}
                                  className="px-2.5 py-1.5 bg-rose-950/60 border border-rose-800/50 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                >
                                  Unsubscribe
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-950/40 flex items-center justify-between text-xs text-gray-400">
              <div>
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, totalCount)} to{" "}
                {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} users
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 bg-gray-800 rounded-md disabled:opacity-40 hover:bg-gray-700 text-white cursor-pointer"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * PAGE_SIZE >= totalCount}
                  className="px-3 py-1.5 bg-gray-800 rounded-md disabled:opacity-40 hover:bg-gray-700 text-white cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PUSH BROADCAST COMPOSER */}
      {activeTab === "push" && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Compose Push Notification
            </h2>

            <form onSubmit={handleSendPush} className="space-y-5">
              {pushStatus.type !== "idle" && (
                <div
                  className={`flex gap-3 p-4 rounded-lg text-sm border ${
                    pushStatus.type === "success"
                      ? "bg-emerald-900/20 border-emerald-900/50 text-emerald-400"
                      : "bg-red-900/20 border-red-900/50 text-red-400"
                  }`}
                >
                  {pushStatus.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0" />
                  )}
                  <span>{pushStatus.message}</span>
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
                    }`}
                  >
                    All Users
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType("specific")}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                      targetType === "specific"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
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
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">
                  Notification Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Markets Open Soon! 🌅"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">
                  Notification Body
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. SGX Nifty indicates action today. Make your prediction now!"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-hidden resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={pushLoading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer"
              >
                {pushLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Notification
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Live Mobile Preview */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Live Preview</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col items-center">
              <div className="w-full max-w-sm bg-gray-950 border border-gray-800 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-800/60">
                  <div className="p-1 bg-indigo-600 rounded-md">
                    <Bell className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-300">
                    Arthavi App
                  </span>
                  <span className="text-[10px] text-gray-500 ml-auto">now</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    {title || "Notification Title"}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-3">
                    {body || "Your notification message will appear here."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UNSUBSCRIBE CONFIRMATION */}
      {actionModalType === "unsubscribe" && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-950/80 text-rose-400 rounded-xl">
                <UserX size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Unsubscribe User
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  {editingUser.email}
                </p>
              </div>
            </div>

            {modalError && (
              <div className="text-xs text-red-400 bg-red-950/40 p-3 rounded-lg border border-red-900/50">
                {modalError}
              </div>
            )}

            <p className="text-xs text-gray-300 leading-relaxed">
              This will immediately pause all daily nudges, weekly summaries, and promotional emails for <strong>{editingUser.full_name}</strong>. Account security alerts will remain active.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">
                Reason for Suppression / Audit Note
              </label>
              <input
                type="text"
                value={unsubReason}
                onChange={(e) => setUnsubReason(e.target.value)}
                placeholder="e.g. User requested removal on WhatsApp"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setActionModalType(null)}
                className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUnsubscribe}
                disabled={modalSaving}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {modalSaving ? "Processing..." : "Confirm Unsubscribe"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GRANULAR PREFERENCES EDIT */}
      {actionModalType === "edit" && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Edit Notification Preferences
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    {editingUser.email}
                  </p>
                </div>
              </div>
            </div>

            {modalError && (
              <div className="text-xs text-red-400 bg-red-950/40 p-3 rounded-lg border border-red-900/50">
                {modalError}
              </div>
            )}

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 text-xs">
              {/* Master Toggle */}
              <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">Global Marketing Suppression</span>
                  <p className="text-gray-500 text-[11px]">Pause all marketing &amp; digests</p>
                </div>
                <input
                  type="checkbox"
                  checked={editForm.unsubscribed_all_marketing}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      unsubscribed_all_marketing: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Email Options */}
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Email Channels
                </p>

                <div className="p-2.5 bg-gray-950/60 border border-gray-800 rounded-lg flex items-center justify-between">
                  <span>Daily Portfolio Nudge</span>
                  <input
                    type="checkbox"
                    checked={editForm.email_daily_nudge}
                    onChange={(e) => setEditForm({ ...editForm, email_daily_nudge: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-2.5 bg-gray-950/60 border border-gray-800 rounded-lg flex items-center justify-between">
                  <span>Weekly Wealth Summary</span>
                  <input
                    type="checkbox"
                    checked={editForm.email_weekly_summary}
                    onChange={(e) => setEditForm({ ...editForm, email_weekly_summary: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-2.5 bg-gray-950/60 border border-gray-800 rounded-lg flex items-center justify-between">
                  <span>Product &amp; Feature Releases</span>
                  <input
                    type="checkbox"
                    checked={editForm.email_product_updates}
                    onChange={(e) => setEditForm({ ...editForm, email_product_updates: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-2.5 bg-gray-950/60 border border-gray-800 rounded-lg flex items-center justify-between">
                  <span>CAS Import &amp; Reports</span>
                  <input
                    type="checkbox"
                    checked={editForm.email_cas_reports}
                    onChange={(e) => setEditForm({ ...editForm, email_cas_reports: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-2.5 bg-gray-950/60 border border-gray-800 rounded-lg flex items-center justify-between">
                  <span>Security &amp; Login Alerts</span>
                  <input
                    type="checkbox"
                    checked={editForm.email_security_alerts}
                    onChange={(e) => setEditForm({ ...editForm, email_security_alerts: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Push Options */}
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Push Channels
                </p>

                <div className="p-2.5 bg-gray-950/60 border border-gray-800 rounded-lg flex items-center justify-between">
                  <span>Daily Market Open/Close Push</span>
                  <input
                    type="checkbox"
                    checked={editForm.push_daily_nudge}
                    onChange={(e) => setEditForm({ ...editForm, push_daily_nudge: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-2.5 bg-gray-950/60 border border-gray-800 rounded-lg flex items-center justify-between">
                  <span>Market Prediction Results</span>
                  <input
                    type="checkbox"
                    checked={editForm.push_market_predictions}
                    onChange={(e) => setEditForm({ ...editForm, push_market_predictions: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setActionModalType(null)}
                className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEdit}
                disabled={modalSaving}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {modalSaving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
