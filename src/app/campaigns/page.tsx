"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Copy,
  Trash2,
  RefreshCw,
  ExternalLink,
  Eye,
  FileText,
  Calendar,
  AlertTriangle,
  Sparkles,
  Phone,
  Link as LinkIcon,
  Check,
  ChevronRight,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Ban,
  ArrowRight
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  fetchCampaignsClient,
  createCampaignClient,
  updateCampaignClient,
  deleteCampaignClient,
  duplicateCampaignClient,
  cancelCampaignClient,
  retryFailedCampaignClient,
  validateRecipientsClient,
  previewEmailClient,
  sendTestEmailClient,
  sendCampaignClient,
  fetchSegmentsSummaryClient,
  searchCampaignUsersClient,
  fetchTemplatesClient,
  createTemplateClient,
  deleteTemplateClient,
  fetchAllDeliveryLogsClient
} from "@/lib/auth-client";

type TabType = "campaigns" | "compose" | "templates" | "logs";

const CAMPAIGN_TYPES = [
  "User Research",
  "Product Feedback",
  "Product Update",
  "Onboarding Follow-up",
  "Retention / Re-engagement",
  "Transactional",
  "Custom"
];

const DEFAULT_BOOKING_URL = "https://calendar.app.google/gEiYcmy3t4cH38BMA";
const DEFAULT_PHONE = "+91 9158110065";
const DEFAULT_FROM_NAME = "Arthavi";
const DEFAULT_FROM_EMAIL = "no-reply@arthavi.com";
const DEFAULT_REPLY_TO = "tejas@arthavi.com";

export default function EmailCampaignsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("campaigns");
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ==========================================
  // TAB 1: CAMPAIGNS STATE
  // ==========================================
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalCampaigns, setTotalCampaigns] = useState(0);

  // ==========================================
  // TAB 2: COMPOSE FORM STATE
  // ==========================================
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [campaignType, setCampaignType] = useState("User Research");
  const [internalNotes, setInternalNotes] = useState("");
  const [campaignTags, setCampaignTags] = useState("");

  // Recipient input mode: manual | users | segment
  const [recipientMode, setRecipientMode] = useState<"manual" | "users" | "segment">("manual");
  const [manualEmails, setManualEmails] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedUsersList, setSelectedUsersList] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState("all_eligible");
  const [segmentsList, setSegmentsList] = useState<any[]>([]);

  // Validation & Suppression state
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validating, setValidating] = useState(false);

  // Sender config
  const [senderName, setSenderName] = useState(DEFAULT_FROM_NAME);
  const [senderEmail, setSenderEmail] = useState(DEFAULT_FROM_EMAIL);
  const [replyToEmail, setReplyToEmail] = useState(DEFAULT_REPLY_TO);

  // Email content
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  // CTA & Booking Link
  const [ctaLabel, setCtaLabel] = useState("Book 15-Min Feedback Session");
  const [ctaUrl, setCtaUrl] = useState(DEFAULT_BOOKING_URL);
  const [bookingUrl, setBookingUrl] = useState(DEFAULT_BOOKING_URL);
  const [phoneContact, setPhoneContact] = useState(DEFAULT_PHONE);
  const [includeCtaButton, setIncludeCtaButton] = useState(true);

  // Modals
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState("tejas@arthavi.com");
  const [testSending, setTestSending] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmUnderstood, setConfirmUnderstood] = useState(false);
  const [queueLoading, setQueueLoading] = useState(false);

  // ==========================================
  // TAB 3: TEMPLATES STATE
  // ==========================================
  const [templates, setTemplates] = useState<any[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    id: null as number | null,
    name: "",
    description: "",
    subject: "",
    preview_text: "",
    html_body: "",
    campaign_type: "User Research"
  });

  // ==========================================
  // TAB 4: DELIVERY LOGS STATE
  // ==========================================
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsFilterStatus, setLogsFilterStatus] = useState("all");
  const [logsSearchTerm, setLogsSearchTerm] = useState("");
  const [logsTotal, setLogsTotal] = useState(0);

  // ==========================================
  // LIFECYCLES
  // ==========================================
  useEffect(() => {
    if (activeTab === "campaigns") {
      loadCampaigns();
    } else if (activeTab === "compose") {
      loadSegments();
      loadTemplates();
    } else if (activeTab === "templates") {
      loadTemplates();
    } else if (activeTab === "logs") {
      loadLogs();
    }
  }, [activeTab, page, statusFilter, typeFilter]);

  // Load Campaigns
  const loadCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const data = await fetchCampaignsClient({
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        campaign_type: typeFilter !== "all" ? typeFilter : undefined,
        skip: (page - 1) * 20,
        limit: 20
      });
      setCampaigns(data.campaigns || []);
      setMetrics(data.metrics || null);
      setTotalCampaigns(data.total || 0);
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Failed to load campaigns" });
    } finally {
      setCampaignsLoading(false);
    }
  };

  // Load Segments
  const loadSegments = async () => {
    try {
      const data = await fetchSegmentsSummaryClient();
      setSegmentsList(data.segments || []);
    } catch (err: any) {
      console.error("Failed to load segments", err);
    }
  };

  // Load Templates
  const loadTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const data = await fetchTemplatesClient();
      setTemplates(data.templates || []);
    } catch (err: any) {
      console.error("Failed to load templates", err);
    } finally {
      setTemplatesLoading(false);
    }
  };

  // Load Delivery Logs
  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const data = await fetchAllDeliveryLogsClient({
        status: logsFilterStatus !== "all" ? logsFilterStatus : undefined,
        search: logsSearchTerm || undefined,
        limit: 50
      });
      setLogs(data.logs || []);
      setLogsTotal(data.total || 0);
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Failed to load delivery logs" });
    } finally {
      setLogsLoading(false);
    }
  };

  // User search for multi-select
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (recipientMode === "users" && userSearchTerm.trim().length >= 2) {
        setUserSearchLoading(true);
        try {
          const res = await searchCampaignUsersClient(userSearchTerm, 0, 15);
          setUserSearchResults(res.users || []);
        } catch (e) {
          console.error(e);
        } finally {
          setUserSearchLoading(false);
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearchTerm, recipientMode]);

  // Apply a template to compose form
  const applyTemplate = (tpl: any) => {
    setSelectedTemplateId(tpl.id);
    setSubject(tpl.subject);
    setPreviewText(tpl.preview_text || "");
    setBodyText(tpl.html_body || tpl.text_body || "");
    if (tpl.campaign_type) setCampaignType(tpl.campaign_type);
    setToast({ type: "success", message: `Loaded template: "${tpl.name}"` });
  };

  // Insert variable into body
  const insertVariable = (varName: string) => {
    setBodyText((prev) => prev + ` ${varName} `);
  };

  // Validate recipients on demand or before send
  const handleValidateRecipients = async () => {
    setValidating(true);
    try {
      const payload: any = {
        campaign_type: campaignType,
      };
      if (recipientMode === "manual" && manualEmails.trim()) {
        payload.manual_emails = manualEmails;
      } else if (recipientMode === "users") {
        payload.selected_user_ids = selectedUserIds;
      } else if (recipientMode === "segment") {
        payload.segment_type = selectedSegment;
      }

      const res = await validateRecipientsClient(payload);
      setValidationResult(res);
      setToast({
        type: "info",
        message: `Validated: ${res.summary.eligible_count} eligible, ${res.summary.excluded_count} excluded.`
      });
      return res;
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Validation failed" });
      return null;
    } finally {
      setValidating(false);
    }
  };

  // Preview Email
  const handleOpenPreview = async () => {
    if (!subject.trim() || !bodyText.trim()) {
      setToast({ type: "error", message: "Subject and Body are required to preview." });
      return;
    }
    setPreviewLoading(true);
    setShowPreviewModal(true);
    try {
      const res = await previewEmailClient({
        subject,
        html_body: bodyText,
        preview_text: previewText,
        cta_config: {
          cta_label: includeCtaButton ? ctaLabel : "",
          cta_url: includeCtaButton ? ctaUrl : "",
          booking_url: bookingUrl,
          phone: phoneContact
        },
        sample_recipient: {
          email: "preview.investor@arthavi.com",
          name: "Priya Sharma",
          unsubscribe_token: "preview_sample_tok"
        },
        is_marketing: campaignType !== "Transactional"
      });
      setPreviewData(res);
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Failed to render preview" });
    } finally {
      setPreviewLoading(false);
    }
  };

  // Send Test Email
  const handleSendTest = async () => {
    if (!testEmailInput.trim()) {
      setToast({ type: "error", message: "Please enter at least one test email address." });
      return;
    }
    setTestSending(true);
    try {
      const emailList = testEmailInput.split(/[,;\s]+/).map((e) => e.trim()).filter(Boolean);
      const res = await sendTestEmailClient({
        test_emails: emailList,
        subject,
        html_body: bodyText,
        preview_text: previewText,
        sender_name: senderName,
        sender_email: senderEmail,
        reply_to_email: replyToEmail,
        cta_config: {
          cta_label: includeCtaButton ? ctaLabel : "",
          cta_url: includeCtaButton ? ctaUrl : "",
          booking_url: bookingUrl,
          phone: phoneContact
        }
      });
      setToast({ type: "success", message: `Test email sent to ${emailList.join(", ")}!` });
      setShowTestModal(false);
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Failed to send test email" });
    } finally {
      setTestSending(false);
    }
  };

  // Save Draft
  const handleSaveDraft = async () => {
    if (!campaignName.trim()) {
      setToast({ type: "error", message: "Campaign name is required." });
      return;
    }
    if (!subject.trim()) {
      setToast({ type: "error", message: "Subject is required." });
      return;
    }
    if (!bodyText.trim()) {
      setToast({ type: "error", message: "Body content is required." });
      return;
    }

    try {
      const config: any = {
        recipient_mode: recipientMode,
        cta_config: {
          cta_label: includeCtaButton ? ctaLabel : "",
          cta_url: includeCtaButton ? ctaUrl : "",
          booking_url: bookingUrl,
          phone: phoneContact
        },
        notes: internalNotes,
        tags: campaignTags
      };
      if (recipientMode === "manual") config.manual_emails = manualEmails;
      if (recipientMode === "users") config.selected_user_ids = selectedUserIds;
      if (recipientMode === "segment") config.segment_type = selectedSegment;

      const payload = {
        name: campaignName.trim(),
        campaign_type: campaignType,
        subject: subject.trim(),
        preview_text: previewText.trim() || undefined,
        html_body: bodyText,
        text_body: bodyText,
        sender_name: senderName,
        sender_email: senderEmail,
        reply_to_email: replyToEmail,
        template_id: selectedTemplateId || undefined,
        recipient_selection_config: config
      };

      if (editingCampaignId) {
        await updateCampaignClient(editingCampaignId, payload);
        setToast({ type: "success", message: "Campaign draft updated successfully." });
      } else {
        const created = await createCampaignClient(payload);
        setEditingCampaignId(created.campaign_id);
        setToast({ type: "success", message: "Campaign draft created successfully." });
      }
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Failed to save draft." });
    }
  };

  // Open Confirm Send Modal
  const handleInitiateSend = async () => {
    if (!campaignName.trim() || !subject.trim() || !bodyText.trim()) {
      setToast({ type: "error", message: "Please complete Campaign Name, Subject, and Body." });
      return;
    }
    // Perform pre-send validation
    const val = await handleValidateRecipients();
    if (!val || val.summary.eligible_count === 0) {
      setToast({ type: "error", message: "No eligible recipients found. Please review suppression and recipient inputs." });
      return;
    }
    setConfirmUnderstood(false);
    setShowConfirmModal(true);
  };

  // Final Confirmation & Dispatch
  const handleConfirmAndSend = async () => {
    setQueueLoading(true);
    try {
      // 1. Ensure draft is saved
      const config: any = {
        recipient_mode: recipientMode,
        cta_config: {
          cta_label: includeCtaButton ? ctaLabel : "",
          cta_url: includeCtaButton ? ctaUrl : "",
          booking_url: bookingUrl,
          phone: phoneContact
        },
        notes: internalNotes,
        tags: campaignTags
      };
      if (recipientMode === "manual") config.manual_emails = manualEmails;
      if (recipientMode === "users") config.selected_user_ids = selectedUserIds;
      if (recipientMode === "segment") config.segment_type = selectedSegment;

      let targetId = editingCampaignId;
      if (!targetId) {
        const created = await createCampaignClient({
          name: campaignName.trim(),
          campaign_type: campaignType,
          subject: subject.trim(),
          preview_text: previewText.trim() || undefined,
          html_body: bodyText,
          text_body: bodyText,
          sender_name: senderName,
          sender_email: senderEmail,
          reply_to_email: replyToEmail,
          template_id: selectedTemplateId || undefined,
          recipient_selection_config: config
        });
        targetId = created.campaign_id;
        setEditingCampaignId(targetId);
      } else {
        await updateCampaignClient(targetId, {
          name: campaignName.trim(),
          campaign_type: campaignType,
          subject: subject.trim(),
          preview_text: previewText.trim() || undefined,
          html_body: bodyText,
          text_body: bodyText,
          sender_name: senderName,
          sender_email: senderEmail,
          reply_to_email: replyToEmail,
          template_id: selectedTemplateId || undefined,
          recipient_selection_config: config
        });
      }

      // 2. Trigger send
      const sendRes = await sendCampaignClient(targetId!);
      setShowConfirmModal(false);
      setToast({
        type: "success",
        message: `Campaign queued successfully for ${sendRes.eligible_count} recipients via AWS SES!`
      });
      // Switch back to campaigns list
      setActiveTab("campaigns");
      loadCampaigns();
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Failed to dispatch campaign." });
    } finally {
      setQueueLoading(false);
    }
  };

  // Save current email as template
  const handleSaveAsTemplate = async () => {
    if (!subject.trim() || !bodyText.trim()) {
      setToast({ type: "error", message: "Subject and Body required to save template." });
      return;
    }
    const templateName = prompt("Enter a name for this new template:", campaignName || "New Outreach Template");
    if (!templateName) return;

    try {
      await createTemplateClient({
        name: templateName.trim(),
        subject: subject.trim(),
        preview_text: previewText.trim() || undefined,
        html_body: bodyText,
        text_body: bodyText,
        campaign_type: campaignType
      });
      setToast({ type: "success", message: `Template "${templateName}" created.` });
      loadTemplates();
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Failed to create template." });
    }
  };

  // Render Status Badge
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

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm animate-in slide-in-from-top-2 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800"
              : toast.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800"
              : "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />}
          {toast.type === "error" && <AlertCircle size={18} className="text-rose-600 dark:text-rose-400" />}
          {toast.type === "info" && <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shadow-xs">
              <Mail size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Email Campaigns &amp; User Outreach
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Production-grade AWS SES outreach, user research invitations, and automated deliverability tracking.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab !== "compose" && (
            <Button
              variant="primary"
              size="md"
              icon={<Plus size={16} />}
              onClick={() => {
                setEditingCampaignId(null);
                setCampaignName("");
                setSubject("");
                setBodyText("");
                setActiveTab("compose");
              }}
            >
              Compose New Email
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-white/[0.08] flex gap-2 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === "campaigns"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Mail size={16} />
          Campaigns
          {metrics?.total_campaigns !== undefined && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {metrics.total_campaigns}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("compose")}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === "compose"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Send size={16} />
          Compose Email
          {editingCampaignId && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              Editing Draft
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === "templates"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <FileText size={16} />
          Email Templates
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === "logs"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Clock size={16} />
          Delivery Logs
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CAMPAIGNS DASHBOARD                                                */}
      {/* ========================================================================= */}
      {activeTab === "campaigns" && (
        <div className="space-y-6">
          {/* Metrics Overview Cards */}
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 sm:p-5">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Campaigns
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {metrics.total_campaigns}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Configured outreach programs</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-5">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Dispatched Emails
                  </p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    {metrics.total_emails_sent?.toLocaleString() || 0}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Accepted by AWS SES</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-5">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Confirmed Delivery
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {metrics.delivery_rate_pct}%
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {metrics.total_delivered?.toLocaleString() || 0} delivered inbox verified
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-5">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Bounce Rate
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${metrics.bounce_rate_pct > 2 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                    {metrics.bounce_rate_pct}%
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {metrics.total_bounced?.toLocaleString() || 0} hard bounces suppressed
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadCampaigns()}
                    placeholder="Search by name, subject, or creator..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Draft">Draft</option>
                    <option value="Queued">Queued</option>
                    <option value="Sending">Sending</option>
                    <option value="Completed">Completed</option>
                    <option value="Completed with Errors">Completed with Errors</option>
                    <option value="Failed">Failed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="all">All Campaign Types</option>
                    {CAMPAIGN_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <Button variant="secondary" size="md" onClick={loadCampaigns} loading={campaignsLoading}>
                    <RefreshCw size={14} className={campaignsLoading ? "animate-spin" : ""} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Email Campaigns</CardTitle>
              <CardDescription>
                View status, deliverability metrics, and drill down into per-recipient delivery logs.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {campaignsLoading ? (
                <div className="py-16 text-center text-slate-400">Loading campaigns...</div>
              ) : campaigns.length === 0 ? (
                <EmptyState
                  icon={Mail}
                  title="No email campaigns found"
                  description="Start your first user outreach or research campaign by composing an email."
                  action={
                    <Button
                      variant="primary"
                      onClick={() => {
                        setEditingCampaignId(null);
                        setActiveTab("compose");
                      }}
                    >
                      Compose Campaign
                    </Button>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="px-5 py-3.5">Campaign Name</th>
                        <th className="px-4 py-3.5">Type</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5 text-right">Recipients</th>
                        <th className="px-4 py-3.5 text-right">Delivered</th>
                        <th className="px-4 py-3.5">Created Date</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                      {campaigns.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-4">
                            <Link
                              href={`/campaigns/${c.id}`}
                              className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5"
                            >
                              {c.name}
                              <ChevronRight size={14} className="text-slate-400" />
                            </Link>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs mt-0.5">
                              {c.subject}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                              {c.campaign_type}
                            </span>
                          </td>
                          <td className="px-4 py-4">{getStatusBadge(c.campaign_status)}</td>
                          <td className="px-4 py-4 text-right">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {c.sent_count > 0 ? `${c.sent_count} / ${c.eligible_recipients}` : c.eligible_recipients || c.total_recipients}
                            </span>
                            {c.excluded_recipients > 0 && (
                              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                                {c.excluded_recipients} excluded
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {c.delivered_count > 0 ? (
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {c.delivered_count} ({Math.round((c.delivered_count / (c.sent_count || 1)) * 100)}%)
                              </span>
                            ) : c.bounced_count > 0 ? (
                              <span className="text-xs text-rose-600">{c.bounced_count} bounced</span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
                            {c.created_at || "—"}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link href={`/campaigns/${c.id}`}>
                                <Button variant="ghost" size="xs" icon={<Eye size={13} />}>
                                  View
                                </Button>
                              </Link>

                              {c.campaign_status === "Draft" && (
                                <Button
                                  variant="secondary"
                                  size="xs"
                                  onClick={() => {
                                    setEditingCampaignId(c.id);
                                    setCampaignName(c.name);
                                    setCampaignType(c.campaign_type);
                                    setSubject(c.subject);
                                    setPreviewText(c.preview_text || "");
                                    setBodyText(c.html_body || "");
                                    setSenderName(c.sender_name || DEFAULT_FROM_NAME);
                                    setSenderEmail(c.sender_email || DEFAULT_FROM_EMAIL);
                                    setReplyToEmail(c.reply_to_email || DEFAULT_REPLY_TO);
                                    setActiveTab("compose");
                                  }}
                                >
                                  Edit
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="xs"
                                title="Duplicate Campaign"
                                onClick={async () => {
                                  try {
                                    await duplicateCampaignClient(c.id);
                                    setToast({ type: "success", message: `Duplicated "${c.name}"` });
                                    loadCampaigns();
                                  } catch (err: any) {
                                    setToast({ type: "error", message: err.message });
                                  }
                                }}
                              >
                                <Copy size={13} />
                              </Button>

                              {c.campaign_status === "Draft" && (
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  title="Delete Draft"
                                  onClick={async () => {
                                    if (confirm(`Delete draft campaign "${c.name}"?`)) {
                                      try {
                                        await deleteCampaignClient(c.id);
                                        setToast({ type: "success", message: "Draft deleted." });
                                        loadCampaigns();
                                      } catch (err: any) {
                                        setToast({ type: "error", message: err.message });
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 size={13} className="text-rose-500" />
                                </Button>
                              )}

                              {(c.campaign_status === "Queued" || c.campaign_status === "Sending") && (
                                <Button
                                  variant="danger"
                                  size="xs"
                                  onClick={async () => {
                                    if (confirm(`Cancel campaign "${c.name}"?`)) {
                                      try {
                                        await cancelCampaignClient(c.id);
                                        setToast({ type: "info", message: "Campaign cancelled." });
                                        loadCampaigns();
                                      } catch (err: any) {
                                        setToast({ type: "error", message: err.message });
                                      }
                                    }
                                  }}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
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
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPOSE EMAIL FORM                                                 */}
      {/* ========================================================================= */}
      {activeTab === "compose" && (
        <div className="space-y-6 max-w-5xl">
          {/* Section A: Campaign Information */}
          <Card>
            <CardHeader>
              <CardTitle>Section A: Campaign Information</CardTitle>
              <CardDescription>Internal identification, outreach intent, and organizational notes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Campaign Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g., Founder Feedback Sprint - April 2026"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Campaign Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    {CAMPAIGN_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Internal Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="e.g., Goal: 10 user interviews on CAS reconciliation"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Campaign Tags (Optional)
                  </label>
                  <input
                    type="text"
                    value={campaignTags}
                    onChange={(e) => setCampaignTags(e.target.value)}
                    placeholder="e.g., user-research, tejas, cas-v2"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section B: Recipients Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle>Section B: Recipients</CardTitle>
                  <CardDescription>Select target audience via manual list, user multi-select, or calculated segment.</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleValidateRecipients}
                  loading={validating}
                  icon={<ShieldCheck size={14} />}
                >
                  Inspect &amp; Validate Recipients
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recipient Source Toggles */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 gap-1 w-full max-w-md">
                <button
                  type="button"
                  onClick={() => setRecipientMode("manual")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    recipientMode === "manual"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Option 1: Manual Emails
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientMode("users")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    recipientMode === "users"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Option 2: Select Users
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientMode("segment")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    recipientMode === "segment"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Option 3: User Segments
                </button>
              </div>

              {/* Option 1: Manual Emails */}
              {recipientMode === "manual" && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Paste email addresses (comma, semicolon, or newline separated):
                  </label>
                  <textarea
                    rows={4}
                    value={manualEmails}
                    onChange={(e) => setManualEmails(e.target.value)}
                    placeholder="tejas@example.com, user1@example.com&#10;user2@example.com; user3@example.com"
                    className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  <p className="text-[11px] text-slate-400">
                    Addresses are automatically parsed, normalized, trimmed, validated, and deduplicated before sending. Invalid formats are flagged for correction.
                  </p>
                </div>
              )}

              {/* Option 2: Searchable User Multi-Select */}
              {recipientMode === "users" && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      placeholder="Type at least 2 characters to search users by name, email, or phone..."
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>

                  {userSearchLoading && <p className="text-xs text-slate-400">Searching database...</p>}

                  {/* Search Results Dropdown List */}
                  {userSearchResults.length > 0 && (
                    <div className="border border-slate-200 dark:border-white/[0.08] rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.06]">
                      <div className="p-2 bg-slate-50 dark:bg-slate-900/60 flex justify-between items-center text-xs">
                        <span className="text-slate-500">Filtered results ({userSearchResults.length})</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newIds = [...selectedUserIds];
                            const newList = [...selectedUsersList];
                            userSearchResults.forEach((u) => {
                              if (!newIds.includes(u.id)) {
                                newIds.push(u.id);
                                newList.push(u);
                              }
                            });
                            setSelectedUserIds(newIds);
                            setSelectedUsersList(newList);
                          }}
                          className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                        >
                          Select all in results
                        </button>
                      </div>
                      {userSearchResults.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => {
                            if (!selectedUserIds.includes(u.id)) {
                              setSelectedUserIds([...selectedUserIds, u.id]);
                              setSelectedUsersList([...selectedUsersList, u]);
                            }
                          }}
                          className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white">{u.name}</span>
                            <span className="text-slate-500 dark:text-slate-400 ml-2">({u.email})</span>
                          </div>
                          {selectedUserIds.includes(u.id) ? (
                            <Badge variant="indigo" size="sm">Selected</Badge>
                          ) : (
                            <span className="text-indigo-600 font-medium">+ Add</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected Users Chips */}
                  {selectedUsersList.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Selected Users ({selectedUsersList.length})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserIds([]);
                            setSelectedUsersList([]);
                          }}
                          className="text-rose-500 hover:underline cursor-pointer"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-slate-200 dark:border-white/[0.08] rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                        {selectedUsersList.map((u) => (
                          <span
                            key={u.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.1] shadow-xs"
                          >
                            <span>{u.name !== "N/A" ? u.name : u.email}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserIds(selectedUserIds.filter((id) => id !== u.id));
                                setSelectedUsersList(selectedUsersList.filter((item) => item.id !== u.id));
                              }}
                              className="text-slate-400 hover:text-rose-500 cursor-pointer"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Option 3: User Segments */}
              {recipientMode === "segment" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {segmentsList.map((seg) => (
                      <div
                        key={seg.key}
                        onClick={() => setSelectedSegment(seg.key)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          selectedSegment === seg.key
                            ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs"
                            : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {seg.name}
                          </span>
                          <Badge variant={selectedSegment === seg.key ? "indigo" : "neutral"} size="sm">
                            ~{seg.estimated_count} users
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          {seg.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                          <span>Period: {seg.period}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section C: Live Eligibility & Suppression Feedback */}
              {validationResult && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Eligibility &amp; Suppression Analysis
                    </span>
                    <Badge variant={validationResult.summary.eligible_count > 0 ? "success" : "danger"}>
                      {validationResult.summary.eligible_count} Eligible Recipients
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/[0.06]">
                      <span className="text-xs text-slate-500">Total Analyzed</span>
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {validationResult.summary.total_selected}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/[0.06]">
                      <span className="text-xs text-emerald-600">Eligible to Send</span>
                      <p className="text-base font-bold text-emerald-600">
                        {validationResult.summary.eligible_count}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/[0.06]">
                      <span className="text-xs text-rose-500">Excluded / Suppressed</span>
                      <p className="text-base font-bold text-rose-600">
                        {validationResult.summary.excluded_count}
                      </p>
                    </div>
                  </div>

                  {/* Reasons Breakdown */}
                  {Object.keys(validationResult.summary.reasons_breakdown || {}).length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        Suppression Reasons:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(validationResult.summary.reasons_breakdown).map(([reason, cnt]: any) => (
                          <Badge key={reason} variant="danger" size="sm">
                            {reason}: {cnt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Invalid Syntax Entries */}
                  {validationResult.manual_parsing?.invalid_entries?.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-rose-500">Invalid Addresses (Action Required):</span>
                      <div className="flex flex-wrap gap-1">
                        {validationResult.manual_parsing.invalid_entries.map((inv: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 text-[11px]"
                          >
                            {inv.raw} ({inv.error})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section D: Sender Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Section D: Verified Sender Configuration</CardTitle>
              <CardDescription>
                Sends through verified AWS SES ap-south-1 identities. Credentials remain securely server-side.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    From Display Name
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Arthavi"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    From Email Address (SES Identity)
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="no-reply@arthavi.com"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Reply-To Address
                  </label>
                  <input
                    type="email"
                    value={replyToEmail}
                    onChange={(e) => setReplyToEmail(e.target.value)}
                    placeholder="tejas@arthavi.com"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section E: Email Content & Personalization */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle>Section E: Email Content &amp; Personalization</CardTitle>
                  <CardDescription>
                    Rich template editor supporting variables with safe fallbacks and responsive layout.
                  </CardDescription>
                </div>
                {/* Template Preset Selector */}
                {templates.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Load Template:</span>
                    <select
                      value={selectedTemplateId || ""}
                      onChange={(e) => {
                        const tId = Number(e.target.value);
                        const tpl = templates.find((t) => t.id === tId);
                        if (tpl) applyTemplate(tpl);
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Select template...</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Could I get 15 minutes of feedback on Arthavi?"
                  className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Preheader / Preview Text (Optional)
                </label>
                <input
                  type="text"
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  placeholder="e.g., A quick conversation with Tejas to help shape Arthavi's roadmap."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Personalization Variable Buttons */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Insert Personalization Variables:
                  </label>
                  <span className="text-[11px] text-slate-400">Click to insert at end of body</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => insertVariable("{{first_name}}")}
                    className="px-2.5 py-1 text-xs rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono font-medium hover:bg-indigo-100 cursor-pointer"
                  >
                    + {"{{first_name}}"}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable("{{email}}")}
                    className="px-2.5 py-1 text-xs rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono font-medium hover:bg-indigo-100 cursor-pointer"
                  >
                    + {"{{email}}"}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable("{{booking_url}}")}
                    className="px-2.5 py-1 text-xs rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono font-medium hover:bg-indigo-100 cursor-pointer"
                  >
                    + {"{{booking_url}}"}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable("{{app_url}}")}
                    className="px-2.5 py-1 text-xs rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono font-medium hover:bg-indigo-100 cursor-pointer"
                  >
                    + {"{{app_url}}"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Body Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={10}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Hi {{first_name}},&#10;&#10;I'm Tejas, founder of Arthavi...&#10;&#10;Book a 15-minute call: {{booking_url}}"
                  className="w-full px-3.5 py-2.5 text-sm font-sans rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section F: Call-to-Action & Booking Link */}
          <Card>
            <CardHeader>
              <CardTitle>Section F: Call-to-Action &amp; Booking Link</CardTitle>
              <CardDescription>
                Configure dedicated CTA button and Google Calendar user research booking links.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeCta"
                  checked={includeCtaButton}
                  onChange={(e) => setIncludeCtaButton(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="includeCta" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Include primary Call-to-Action button
                </label>
              </div>

              {includeCtaButton && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={ctaLabel}
                      onChange={(e) => setCtaLabel(e.target.value)}
                      placeholder="Book 15-Min Feedback Session"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      CTA Button Destination URL
                    </label>
                    <input
                      type="url"
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      placeholder="https://calendar.app.google/gEiYcmy3t4cH38BMA"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Google Calendar Booking URL
                  </label>
                  <input
                    type="url"
                    value={bookingUrl}
                    onChange={(e) => setBookingUrl(e.target.value)}
                    placeholder="https://calendar.app.google/gEiYcmy3t4cH38BMA"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone / WhatsApp Contact Text
                  </label>
                  <input
                    type="text"
                    value={phoneContact}
                    onChange={(e) => setPhoneContact(e.target.value)}
                    placeholder="+91 9158110065"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section G: Email Footer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Section G: Email Footer &amp; Compliance</CardTitle>
              <CardDescription>
                Automated Arthavi footer, support channel, and functional unsubscribe link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p>
                  <strong>Company:</strong> Arthavi &bull; Personal Finance &amp; Portfolio Tracker
                </p>
                <p>
                  <strong>Website:</strong> https://arthavi.com &bull; <strong>Support:</strong> {replyToEmail}
                </p>
                <p>
                  <strong>Unsubscribe:</strong> One-click RFC 8058 compliant token link will be automatically generated for every recipient.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sticky Bottom Actions Bar */}
          <div className="sticky bottom-4 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-white/[0.1] shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="md" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button variant="outline" size="md" onClick={handleSaveAsTemplate}>
                Save as Template
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="md"
                icon={<Eye size={16} />}
                onClick={handleOpenPreview}
              >
                Preview Email
              </Button>
              <Button
                variant="secondary"
                size="md"
                icon={<Mail size={16} />}
                onClick={() => setShowTestModal(true)}
              >
                Send Test Email
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={<Send size={16} />}
                onClick={handleInitiateSend}
              >
                Send Campaign...
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EMAIL TEMPLATES                                                    */}
      {/* ========================================================================= */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Reusable Email Templates</h2>
              <p className="text-xs text-slate-500">Pre-designed messages for feedback, updates, and research.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => {
                setTemplateForm({
                  id: null,
                  name: "",
                  description: "",
                  subject: "",
                  preview_text: "",
                  html_body: "",
                  campaign_type: "User Research"
                });
                setTemplateModalOpen(true);
              }}
            >
              New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <Card key={tpl.id} className="flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold">{tpl.name}</CardTitle>
                      <span className="text-[11px] text-slate-400">{tpl.campaign_type}</span>
                    </div>
                    {tpl.is_system && (
                      <Badge variant="indigo" size="sm">
                        System Default
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col justify-between pt-0">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Subject: <span className="font-normal text-slate-600 dark:text-slate-400">{tpl.subject}</span>
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-3 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.04]">
                      {tpl.html_body}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => {
                        applyTemplate(tpl);
                        setActiveTab("compose");
                      }}
                    >
                      Use in Campaign
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          setTemplateForm({
                            id: tpl.id,
                            name: tpl.name,
                            description: tpl.description || "",
                            subject: tpl.subject,
                            preview_text: tpl.preview_text || "",
                            html_body: tpl.html_body,
                            campaign_type: tpl.campaign_type || "User Research"
                          });
                          setTemplateModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      {!tpl.is_system && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={async () => {
                            if (confirm(`Delete template "${tpl.name}"?`)) {
                              try {
                                await deleteTemplateClient(tpl.id);
                                setToast({ type: "success", message: "Template deleted." });
                                loadTemplates();
                              } catch (e: any) {
                                setToast({ type: "error", message: e.message });
                              }
                            }
                          }}
                        >
                          <Trash2 size={13} className="text-rose-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DELIVERY LOGS                                                      */}
      {/* ========================================================================= */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={logsSearchTerm}
                    onChange={(e) => setLogsSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadLogs()}
                    placeholder="Search logs by recipient email or name..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={logsFilterStatus}
                    onChange={(e) => setLogsFilterStatus(e.target.value)}
                    className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="all">All Delivery Statuses</option>
                    <option value="Accepted by SES">Accepted by SES</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Bounced">Bounced</option>
                    <option value="Complaint">Complaint</option>
                    <option value="Failed">Failed</option>
                    <option value="Suppressed">Suppressed</option>
                  </select>

                  <Button variant="secondary" size="md" onClick={loadLogs} loading={logsLoading}>
                    <RefreshCw size={14} className={logsLoading ? "animate-spin" : ""} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-5 py-3.5">Recipient</th>
                      <th className="px-4 py-3.5">Campaign</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">SES Message ID</th>
                      <th className="px-4 py-3.5">Error / Diagnostic</th>
                      <th className="px-5 py-3.5 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                    {logs.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 text-xs">
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-slate-900 dark:text-white">{l.email}</span>
                          {l.name !== "—" && <span className="text-slate-400 ml-1.5">({l.name})</span>}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{l.campaign_name}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              l.status === "Delivered"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : l.status === "Accepted by SES"
                                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                                : l.status === "Bounced" || l.status === "Failed"
                                ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                          {l.provider_message_id || "—"}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate">{l.last_error || "—"}</td>
                        <td className="px-5 py-3.5 text-right text-slate-400">{l.updated_at || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PREVIEW EMAIL MODAL                                              */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Email Render Preview"
        description="Live preview rendered for sample recipient Priya Sharma."
        maxWidth="2xl"
      >
        {previewLoading ? (
          <div className="py-16 text-center text-slate-400">Rendering email preview...</div>
        ) : previewData ? (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs space-y-1">
              <p>
                <strong>Subject:</strong> {previewData.rendered_subject}
              </p>
              <p>
                <strong>From:</strong> {senderName} &lt;{senderEmail}&gt;
              </p>
              <p>
                <strong>To:</strong> Priya Sharma &lt;preview.investor@arthavi.com&gt;
              </p>
            </div>

            {/* Rendered HTML Container */}
            <div className="border border-slate-200 dark:border-white/[0.1] rounded-xl overflow-hidden max-h-[500px] overflow-y-auto bg-white">
              <iframe
                title="Preview"
                srcDoc={previewData.rendered_html}
                className="w-full min-h-[460px] border-none"
              />
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: SEND TEST EMAIL MODAL                                            */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title="Send Test Email"
        description="Verify layout, deliverability, and spam scoring before sending to real audience."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Test Recipient Address(es)
            </label>
            <input
              type="text"
              value={testEmailInput}
              onChange={(e) => setTestEmailInput(e.target.value)}
              placeholder="tejas@arthavi.com, test@example.com"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Test emails are dispatched exclusively to these addresses and will NEVER contact the campaign audience.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowTestModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={testSending} onClick={handleSendTest}>
              Send Test Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: IRREVERSIBLE CONFIRMATION MODAL                                  */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Campaign Dispatch"
        description="Review final recipient counts and suppression exclusions before queueing."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle size={16} />
              Sending to real users is irreversible!
            </div>
            <p>
              Once queued, emails will be dispatched asynchronously via AWS SES. Please confirm you have reviewed the content and recipient list.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Campaign Name:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{campaignName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Campaign Type:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{campaignType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Subject:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sender:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{senderName} &lt;{senderEmail}&gt;</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reply-To:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{replyToEmail}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex justify-between font-bold text-sm">
              <span className="text-emerald-600">Eligible Recipients to Send:</span>
              <span className="text-emerald-600">{validationResult?.summary?.eligible_count || 0}</span>
            </div>
            {validationResult?.summary?.excluded_count > 0 && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>Suppressed / Excluded:</span>
                <span>{validationResult.summary.excluded_count}</span>
              </div>
            )}
          </div>

          {/* Large Audience Warning */}
          {validationResult?.summary?.eligible_count > 50 && (
            <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl text-xs text-sky-800 dark:text-sky-200">
              Notice: Large campaign ({validationResult.summary.eligible_count} recipients). The send will be processed in controlled batches to protect SES quotas.
            </div>
          )}

          {/* Explicit Confirmation Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="confirmUnderstand"
              checked={confirmUnderstood}
              onChange={(e) => setConfirmUnderstood(e.target.checked)}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="confirmUnderstand" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
              I have verified the email content, personalization variables, and recipient eligibility. I understand that sending is irreversible.
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Back
            </Button>
            <Button
              variant="primary"
              disabled={!confirmUnderstood}
              loading={queueLoading}
              onClick={handleConfirmAndSend}
            >
              Queue &amp; Send Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: TEMPLATE CREATE / EDIT MODAL                                     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        title={templateForm.id ? "Edit Template" : "New Email Template"}
        description="Save reusable templates with personalization tags."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={templateForm.name}
              onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              placeholder="e.g., Founder Feedback Invitation"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={templateForm.subject}
              onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
              placeholder="Subject line with {{first_name}}..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Body Template
            </label>
            <textarea
              rows={8}
              value={templateForm.html_body}
              onChange={(e) => setTemplateForm({ ...templateForm, html_body: e.target.value })}
              placeholder="Body text..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setTemplateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (!templateForm.name || !templateForm.subject || !templateForm.html_body) {
                  setToast({ type: "error", message: "Please fill all fields" });
                  return;
                }
                try {
                  if (templateForm.id) {
                    await createTemplateClient({
                      name: templateForm.name,
                      subject: templateForm.subject,
                      preview_text: templateForm.preview_text,
                      html_body: templateForm.html_body,
                      campaign_type: templateForm.campaign_type
                    });
                  } else {
                    await createTemplateClient({
                      name: templateForm.name,
                      subject: templateForm.subject,
                      preview_text: templateForm.preview_text,
                      html_body: templateForm.html_body,
                      campaign_type: templateForm.campaign_type
                    });
                  }
                  setTemplateModalOpen(false);
                  setToast({ type: "success", message: "Template saved." });
                  loadTemplates();
                } catch (e: any) {
                  setToast({ type: "error", message: e.message });
                }
              }}
            >
              Save Template
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
