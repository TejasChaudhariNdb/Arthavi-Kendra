"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  RefreshCw,
  Copy,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Ban,
  Calendar
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  fetchCampaignDetailClient,
  fetchCampaignRecipientsClient,
  retryFailedCampaignClient,
  cancelCampaignClient,
  duplicateCampaignClient
} from "@/lib/auth-client";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = Number(params?.id);

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecipients, setTotalRecipients] = useState(0);
  const [page, setPage] = useState(1);
  const [retrying, setRetrying] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (campaignId) {
      loadDetail();
      loadRecipients();
    }
  }, [campaignId, statusFilter, page]);

  const loadDetail = async () => {
    try {
      const data = await fetchCampaignDetailClient(campaignId);
      setCampaign(data);
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Failed to load campaign" });
    } finally {
      setLoading(false);
    }
  };

  const loadRecipients = async () => {
    setRecipientsLoading(true);
    try {
      const data = await fetchCampaignRecipientsClient(campaignId, {
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
        skip: (page - 1) * 50,
        limit: 50
      });
      setRecipients(data.recipients || []);
      setTotalRecipients(data.total || 0);
    } catch (err: any) {
      console.error(err);
    } finally {
      setRecipientsLoading(false);
    }
  };

  const handleRetryFailed = async () => {
    setRetrying(true);
    try {
      const res = await retryFailedCampaignClient(campaignId);
      setToast({ type: "success", message: res.message });
      loadDetail();
      loadRecipients();
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Retry failed." });
    } finally {
      setRetrying(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this campaign?")) return;
    try {
      await cancelCampaignClient(campaignId);
      setToast({ type: "info", message: "Campaign cancelled." });
      loadDetail();
      loadRecipients();
    } catch (err: any) {
      setToast({ type: "error", message: err.message });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge variant="success">Completed</Badge>;
      case "Sending":
        return <Badge variant="indigo">Sending</Badge>;
      case "Queued":
        return <Badge variant="sky">Queued</Badge>;
      case "Draft":
        return <Badge variant="neutral">Draft</Badge>;
      case "Scheduled":
        return <Badge variant="amber">Scheduled</Badge>;
      case "Completed with Errors":
        return <Badge variant="warning">Completed with Errors</Badge>;
      case "Failed":
        return <Badge variant="danger">Failed</Badge>;
      case "Cancelled":
        return <Badge variant="neutral">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        Loading campaign details...
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="py-24 text-center space-y-4">
        <p className="text-slate-500">Campaign #{campaignId} not found.</p>
        <Link href="/campaigns">
          <Button variant="secondary">Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  const stats = campaign.stats || {};
  const progressPct =
    stats.eligible_recipients > 0
      ? Math.round((stats.sent_count / stats.eligible_recipients) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-300"
              : toast.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-300"
              : "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-200 border-indigo-300"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 size={18} />}
          {toast.type === "error" && <AlertTriangle size={18} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/campaigns" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <ArrowLeft size={13} />
              Email Campaigns
            </Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">#{campaign.id}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {campaign.name}
            </h1>
            {getStatusBadge(campaign.campaign_status)}
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
              {campaign.campaign_type}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stats.failed_count > 0 && (
            <Button
              variant="secondary"
              size="md"
              loading={retrying}
              onClick={handleRetryFailed}
              icon={<RefreshCw size={14} />}
            >
              Retry {stats.failed_count} Failed
            </Button>
          )}

          {(campaign.campaign_status === "Queued" || campaign.campaign_status === "Sending") && (
            <Button variant="danger" size="md" onClick={handleCancel}>
              Cancel Campaign
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            icon={<Copy size={14} />}
            onClick={async () => {
              try {
                const res = await duplicateCampaignClient(campaign.id);
                setToast({ type: "success", message: "Duplicated as new draft." });
                router.push("/campaigns");
              } catch (e: any) {
                setToast({ type: "error", message: e.message });
              }
            }}
          >
            Duplicate
          </Button>

          <Button variant="secondary" size="md" onClick={() => { loadDetail(); loadRecipients(); }}>
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {stats.eligible_recipients > 0 && (
        <Card className="p-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Dispatch Progress: {stats.sent_count} of {stats.eligible_recipients} Dispatched ({progressPct}%)
            </span>
            <span className="text-slate-500">
              Started: {campaign.started_at || "—"} &bull; Completed: {campaign.completed_at || "—"}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                stats.failed_count > 0
                  ? "bg-amber-500"
                  : progressPct === 100
                  ? "bg-emerald-500"
                  : "bg-indigo-600"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </Card>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <span className="text-xs text-slate-500 font-medium">Total Audience</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.total_recipients || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <span className="text-xs text-emerald-600 font-medium">Eligible</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {stats.eligible_recipients || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <span className="text-xs text-indigo-600 font-medium">Accepted (SES)</span>
            <p className="text-xl font-bold text-indigo-600 mt-1">
              {stats.sent_count || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <span className="text-xs text-emerald-600 font-medium">Delivered</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {stats.delivered_count || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <span className="text-xs text-rose-500 font-medium">Bounced</span>
            <p className="text-xl font-bold text-rose-600 mt-1">
              {stats.bounced_count || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <span className="text-xs text-amber-600 font-medium">Complaints</span>
            <p className="text-xl font-bold text-amber-600 mt-1">
              {stats.complaint_count || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details & Content Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Metadata */}
        <Card className="md:col-span-1 space-y-4">
          <CardHeader>
            <CardTitle>Campaign Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500">Subject:</span>
              <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{campaign.subject}</p>
            </div>
            {campaign.preview_text && (
              <div>
                <span className="text-slate-500">Preview Text:</span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">{campaign.preview_text}</p>
              </div>
            )}
            <div>
              <span className="text-slate-500">Sender Identity:</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                {campaign.sender_name} &lt;{campaign.sender_email}&gt;
              </p>
            </div>
            <div>
              <span className="text-slate-500">Reply-To Address:</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">{campaign.reply_to_email || "Default"}</p>
            </div>
            <div>
              <span className="text-slate-500">Created By:</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">{campaign.created_by || "Admin"}</p>
            </div>
            <div>
              <span className="text-slate-500">Created At:</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">{campaign.created_at}</p>
            </div>
            {stats.excluded_recipients > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-300">
                {stats.excluded_recipients} recipient(s) were automatically excluded due to unsubscribed preferences or hard-bounce suppression list.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Message Body Preview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Email Message Body</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] text-xs font-sans whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed text-slate-800 dark:text-slate-200">
              {campaign.html_body}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recipient-Level Delivery Logs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div>
              <CardTitle>Recipient Delivery Status &amp; Logs</CardTitle>
              <CardDescription>
                Live delivery state, AWS SES message tracking, and error diagnostics per recipient.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-48 sm:w-60">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadRecipients()}
                  placeholder="Search recipient..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="all">All Statuses ({totalRecipients})</option>
                <option value="Pending">Pending</option>
                <option value="Accepted by SES">Accepted by SES</option>
                <option value="Delivered">Delivered</option>
                <option value="Bounced">Bounced</option>
                <option value="Complaint">Complaint</option>
                <option value="Failed">Failed</option>
                <option value="Suppressed">Suppressed</option>
                <option value="Skipped">Skipped</option>
              </select>

              <Button variant="secondary" size="xs" onClick={loadRecipients} loading={recipientsLoading}>
                <RefreshCw size={13} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recipientsLoading ? (
            <div className="py-16 text-center text-slate-400 text-xs">Loading recipient logs...</div>
          ) : recipients.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No recipients found matching current filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px]">
                    <th className="px-5 py-3">Recipient Email</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">SES Message ID</th>
                    <th className="px-4 py-3">Accepted At</th>
                    <th className="px-4 py-3">Delivered At</th>
                    <th className="px-5 py-3">Diagnostics / Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {recipients.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3">
                        <span className="font-semibold text-slate-900 dark:text-white">{r.email}</span>
                        {r.name !== "—" && <span className="text-slate-400 ml-1.5">({r.name})</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === "Delivered"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : r.status === "Accepted by SES"
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                              : r.status === "Bounced" || r.status === "Failed"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                              : r.status === "Suppressed"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                        {r.provider_message_id || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{r.accepted_at || "—"}</td>
                      <td className="px-4 py-3 text-slate-400">{r.delivered_at || "—"}</td>
                      <td className="px-5 py-3 max-w-xs truncate text-rose-600 dark:text-rose-400">
                        {r.last_error || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
