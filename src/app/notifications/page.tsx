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
  Smartphone,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

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
  const [statusFilter, setStatusFilter] = useState<"all" | "subscribed" | "unsubscribed" | "bounced" | "complaints">("all");
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
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Mailing List &amp; Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Suppression lists, user notification preferences &amp; push broadcast composer
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] p-1 rounded-2xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("mailing_list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "mailing_list"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Mail className="w-4 h-4" />
            Mailing List
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("push")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "push"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Bell className="w-4 h-4" />
            Push Broadcast
          </button>
        </div>
      </div>

      {/* TAB 1: MAILING LIST & PREFERENCE ENGINE */}
      {activeTab === "mailing_list" && (
        <div className="space-y-6">
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Users</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
                {stats ? stats.total_users.toLocaleString() : "..."}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Subscribers</span>
                <UserCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                {stats ? stats.active_subscribers.toLocaleString() : "..."}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Unsubscribed</span>
                <UserX className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-xl sm:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                  {stats ? stats.unsubscribed_count.toLocaleString() : "..."}
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  ({stats ? stats.unsubscribe_rate_pct : 0}%)
                </span>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Bounced</span>
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-2">
                {stats ? (stats.bounced_count || 0).toLocaleString() : "..."}
              </p>
            </Card>

            <Card className="p-4 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Push Opt-Ins</span>
                <Smartphone className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-2">
                {stats ? stats.push_users_count.toLocaleString() : "..."}
              </p>
            </Card>
          </div>

          {/* Search, Filter & Actions Bar */}
          <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
              <input
                type="text"
                placeholder="Search user by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>

            {/* Filter Tabs & Refresh */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
              <div className="flex bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] p-0.5 rounded-xl text-xs font-semibold overflow-x-auto">
                <button
                  type="button"
                  onClick={() => { setStatusFilter("all"); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === "all"
                      ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter("subscribed"); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === "subscribed"
                      ? "bg-white dark:bg-emerald-600 text-emerald-700 dark:text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Subscribed
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter("unsubscribed"); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === "unsubscribed"
                      ? "bg-white dark:bg-rose-600 text-rose-700 dark:text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Unsubscribed
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter("bounced"); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === "bounced"
                      ? "bg-white dark:bg-amber-600 text-amber-700 dark:text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Bounced
                </button>
              </div>

              <button
                type="button"
                onClick={() => { loadStats(); loadMailingList(); }}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw className={`w-4 h-4 ${listLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </Card>

          {/* User Table Card */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 dark:bg-white/[0.02] text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-white/[0.08]">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Mailing Status</th>
                    <th className="px-5 py-3.5">Active Channels</th>
                    <th className="px-5 py-3.5">Unsubscribed Info</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.04]">
                  {listLoading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500 mb-2" />
                        Loading mailing list...
                      </td>
                    </tr>
                  ) : mailingList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                        No users found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    mailingList.map((item) => {
                      const isUnsubscribed = item.preferences.unsubscribed_all_marketing;
                      return (
                        <tr key={item.user_id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                          {/* User info */}
                          <td className="px-5 py-3.5">
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                {item.full_name}
                                {!item.is_active && (
                                  <Badge variant="rose" size="sm">
                                    Deactivated
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                {item.email}
                              </div>
                              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                ID: {item.user_id} · Joined {item.created_at}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5">
                            {item.preferences.is_bounced ? (
                              <Badge variant="amber" size="sm">
                                <AlertCircle className="w-3 h-3" /> Bounced (SES)
                              </Badge>
                            ) : item.preferences.is_complained ? (
                              <Badge variant="rose" size="sm">
                                <AlertCircle className="w-3 h-3" /> Spam Complaint
                              </Badge>
                            ) : isUnsubscribed ? (
                              <Badge variant="rose" size="sm">
                                <UserX className="w-3 h-3" /> Unsubscribed
                              </Badge>
                            ) : (
                              <Badge variant="emerald" size="sm">
                                <UserCheck className="w-3 h-3" /> Active Subscriber
                              </Badge>
                            )}
                          </td>

                          {/* Active Channels */}
                          <td className="px-5 py-3.5">
                            <div className="flex flex-wrap gap-1.5">
                              {item.preferences.email_daily_nudge && !isUnsubscribed && (
                                <Badge variant="indigo" size="sm">
                                  🌅 Daily Nudge
                                </Badge>
                              )}
                              {item.preferences.email_weekly_summary && !isUnsubscribed && (
                                <Badge variant="emerald" size="sm">
                                  📊 Weekly Summary
                                </Badge>
                              )}
                              {item.preferences.email_product_updates && !isUnsubscribed && (
                                <Badge variant="neutral" size="sm">
                                  🚀 Product Updates
                                </Badge>
                              )}
                              {item.has_push_token && (
                                <Badge variant="neutral" size="sm">
                                  📱 Push Token
                                </Badge>
                              )}
                              {isUnsubscribed && (
                                <span className="text-[11px] text-slate-400 italic">
                                  All marketing digests paused
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Unsubscribed info */}
                          <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                            {isUnsubscribed ? (
                              <div>
                                <p className="font-semibold text-slate-700 dark:text-slate-300">
                                  {item.preferences.unsubscribed_at || "Recent"}
                                </p>
                                <p className="text-slate-400 text-[11px] mt-0.5 max-w-xs truncate" title={item.preferences.unsubscribe_reason}>
                                  Reason: {item.preferences.unsubscribe_reason || "Not specified"}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Copy 1-Click Unsubscribe Link */}
                              <button
                                type="button"
                                onClick={() => copyUnsubscribeLink(item.preferences.unsubscribe_token, item.user_id)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Copy 1-Click Unsubscribe URL"
                              >
                                {copiedTokenUserId === item.user_id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Edit Toggles */}
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <Sliders className="w-3 h-3" /> Edit
                              </button>

                              {/* Toggle Unsubscribe */}
                              {isUnsubscribed ? (
                                <button
                                  type="button"
                                  onClick={() => handleQuickResubscribe(item.user_id)}
                                  className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                                >
                                  Resubscribe
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openUnsubscribeModal(item)}
                                  className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/60"
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
            <div className="p-4 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.01] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div>
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, totalCount)} to{" "}
                {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} users
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/[0.1] text-slate-800 dark:text-white cursor-pointer font-semibold"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * PAGE_SIZE >= totalCount}
                  className="px-3 py-1.5 bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/[0.1] text-slate-800 dark:text-white cursor-pointer font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: PUSH BROADCAST COMPOSER */}
      {activeTab === "push" && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">
              Compose Push Notification
            </h2>

            <form onSubmit={handleSendPush} className="space-y-4">
              {pushStatus.type !== "idle" && (
                <div
                  className={`flex gap-3 p-4 rounded-xl text-xs sm:text-sm border ${
                    pushStatus.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
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
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Target Audience
                </label>
                <div className="flex bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setTargetType("all")}
                    className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                      targetType === "all"
                        ? "bg-indigo-600 text-white shadow-sm font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    All Users
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType("specific")}
                    className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                      targetType === "specific"
                        ? "bg-indigo-600 text-white shadow-sm font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Specific Users
                  </button>
                </div>
              </div>

              {targetType === "specific" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    User IDs (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1, 4, 15"
                    value={userIdsStr}
                    onChange={(e) => setUserIdsStr(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Notification Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Markets Open Soon! 🌅"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Notification Body
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. SGX Nifty indicates action today. Make your prediction now!"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={pushLoading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-sm transition-all cursor-pointer text-xs sm:text-sm"
              >
                {pushLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Broadcast
                  </>
                )}
              </button>
            </form>
          </Card>

          {/* Live Mobile Preview */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Live Mobile Preview</h2>
            <Card className="p-6 flex flex-col items-center justify-center">
              <div className="w-full max-w-sm bg-slate-50 dark:bg-[#070a13] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 shadow-md">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200/60 dark:border-white/[0.06]">
                  <div className="p-1 bg-indigo-600 rounded-md">
                    <Bell className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Arthavi
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto">now</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {title || "Notification Title Preview"}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {body || "Your broadcast message preview will appear here as users would see on iOS / Android."}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* MODAL: UNSUBSCRIBE CONFIRMATION */}
      {actionModalType === "unsubscribe" && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-800">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Unsubscribe User
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {editingUser.email}
                </p>
              </div>
            </div>

            {modalError && (
              <div className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50">
                {modalError}
              </div>
            )}

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will immediately pause all daily nudges, weekly summaries, and promotional emails for <strong>{editingUser.full_name}</strong>. Account security alerts will remain active.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Reason for Suppression / Audit Note
              </label>
              <input
                type="text"
                value={unsubReason}
                onChange={(e) => setUnsubReason(e.target.value)}
                placeholder="e.g. User requested removal on WhatsApp"
                className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setActionModalType(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
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
          </Card>
        </div>
      )}

      {/* MODAL: GRANULAR PREFERENCES EDIT */}
      {actionModalType === "edit" && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Notification Preferences
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {editingUser.email}
                  </p>
                </div>
              </div>
            </div>

            {modalError && (
              <div className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50">
                {modalError}
              </div>
            )}

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 text-xs">
              {/* Master Toggle */}
              <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Global Marketing Suppression</span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Pause all marketing &amp; digests</p>
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
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Email Channels
                </p>

                <div className="p-2.5 bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] rounded-xl flex items-center justify-between">
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Daily Portfolio Nudge</span>
                  <input
                    type="checkbox"
                    checked={editForm.email_daily_nudge}
                    onChange={(e) => setEditForm({ ...editForm, email_daily_nudge: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-2.5 bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] rounded-xl flex items-center justify-between">
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Weekly Wealth Summary</span>
                  <input
                    type="checkbox"
                    checked={editForm.email_weekly_summary}
                    onChange={(e) => setEditForm({ ...editForm, email_weekly_summary: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-2.5 bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] rounded-xl flex items-center justify-between">
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Product &amp; Feature Releases</span>
                  <input
                    type="checkbox"
                    checked={editForm.email_product_updates}
                    onChange={(e) => setEditForm({ ...editForm, email_product_updates: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-2.5 bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] rounded-xl flex items-center justify-between">
                  <span className="text-slate-800 dark:text-slate-200 font-medium">CAS Import &amp; Reports</span>
                  <input
                    type="checkbox"
                    checked={editForm.email_cas_reports}
                    onChange={(e) => setEditForm({ ...editForm, email_cas_reports: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-2.5 bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] rounded-xl flex items-center justify-between">
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Security &amp; Login Alerts</span>
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
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Push Channels
                </p>

                <div className="p-2.5 bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] rounded-xl flex items-center justify-between">
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Daily Market Open/Close Push</span>
                  <input
                    type="checkbox"
                    checked={editForm.push_daily_nudge}
                    onChange={(e) => setEditForm({ ...editForm, push_daily_nudge: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-2.5 bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] rounded-xl flex items-center justify-between">
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Market Prediction Results</span>
                  <input
                    type="checkbox"
                    checked={editForm.push_market_predictions}
                    onChange={(e) => setEditForm({ ...editForm, push_market_predictions: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setActionModalType(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEdit}
                disabled={modalSaving}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {modalSaving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
