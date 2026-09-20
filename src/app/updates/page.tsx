"use client";

import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Plus,
  Edit2,
  Calendar,
  ExternalLink,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  fetchAdminUpdatesClient,
  createAdminUpdateClient,
  updateAdminUpdateClient,
} from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

interface AdminUpdateData {
  id: number;
  title: string;
  description: string;
  cta_text?: string;
  cta_link?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminUpdatesPage() {
  const [updates, setUpdates] = useState<AdminUpdateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAdminUpdatesClient();
      setUpdates(data || []);
    } catch (e: any) {
      console.error(e);
      setError("Failed to retrieve platform updates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCtaText("");
    setCtaLink("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (update: AdminUpdateData) => {
    setIsEditing(true);
    setEditingId(update.id);
    setTitle(update.title);
    setDescription(update.description);
    setCtaText(update.cta_text || "");
    setCtaLink(update.cta_link || "");
    setIsActive(update.is_active);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setFormSubmitting(true);
    setStatusMsg(null);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      cta_text: ctaText.trim() || undefined,
      cta_link: ctaLink.trim() || undefined,
      is_active: isActive,
    };

    try {
      if (isEditing && editingId !== null) {
        await updateAdminUpdateClient(editingId, payload);
        setStatusMsg({ type: "success", text: "Changelog update saved successfully!" });
      } else {
        await createAdminUpdateClient(payload);
        setStatusMsg({ type: "success", text: "New platform announcement created!" });
      }
      setIsModalOpen(false);
      loadUpdates();
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: "error", text: err.message || "Failed to save update." });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (update: AdminUpdateData) => {
    setStatusMsg(null);
    const payload = {
      title: update.title,
      description: update.description,
      cta_text: update.cta_text,
      cta_link: update.cta_link,
      is_active: !update.is_active,
    };

    try {
      await updateAdminUpdateClient(update.id, payload);
      setUpdates((prev) =>
        prev.map((item) =>
          item.id === update.id ? { ...item, is_active: !item.is_active } : item
        )
      );
      setStatusMsg({
        type: "success",
        text: `Update status changed to ${!update.is_active ? "Active" : "Inactive"}.`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: "error", text: "Failed to toggle update status." });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const activeCount = updates.filter((u) => u.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              What&apos;s New &amp; Changelogs
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Compose and publish platform changelogs &amp; in-app announcement cards
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm cursor-pointer text-xs sm:text-sm self-start sm:self-auto"
        >
          <Plus size={16} />
          Create Announcement
        </button>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Changelogs</p>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1.5">{updates.length}</p>
        </Card>
        <Card className="p-4 sm:p-5">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Alerts</p>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1.5">{activeCount}</p>
        </Card>
        <Card className="p-4 sm:p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inactive Items</p>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-600 dark:text-slate-400 mt-1.5">
            {updates.length - activeCount}
          </p>
        </Card>
      </div>

      {/* Alert Messaging */}
      {statusMsg && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl text-xs sm:text-sm border ${
            statusMsg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="font-semibold">{statusMsg.text}</span>
        </div>
      )}

      {/* Feed list */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm font-medium">Retrieving platform changelogs...</div>
      ) : error ? (
        <Card className="p-12 text-center border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold text-sm">
          {error}
        </Card>
      ) : updates.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            icon={Sparkles}
            title="No updates composed yet"
            description="Click 'Create Announcement' above to publish your first release note."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <Card
              key={update.id}
              className={`p-5 sm:p-6 transition-all ${
                update.is_active ? "border-slate-200/80 dark:border-white/[0.08]" : "opacity-70 border-slate-200/60 dark:border-white/[0.04]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">{update.title}</h2>
                    <Badge variant={update.is_active ? "emerald" : "neutral"} size="sm">
                      {update.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Created {formatDate(update.created_at)}</span>
                  </div>
                </div>

                {/* Quick actions panel */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => openEditModal(update)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Edit Announcement"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(update)}
                    className={`p-1.5 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer ${
                      update.is_active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600"
                    }`}
                    title={update.is_active ? "Deactivate Announcement" : "Activate Announcement"}
                  >
                    {update.is_active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                  </button>
                </div>
              </div>

              {/* Description body */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mb-4 bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
                {update.description}
              </p>

              {/* CTA link preview */}
              {update.cta_link && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">CTA Action:</span>
                  <span className="bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-lg font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.06]">
                    {update.cta_text || "Explore"}
                  </span>
                  <span>→</span>
                  <a
                    href={update.cta_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {update.cta_link}
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Compose/Edit Modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? "Edit Changelog Update" : "Create Changelog Update"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Update Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Family Portfolio V1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl py-2 px-3.5 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Update Description
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe the new features. Supports markdown lists or multi-line paragraphs."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl py-2 px-3.5 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    CTA Action Text (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Explore"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    maxLength={30}
                    className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl py-2 px-3.5 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    CTA Action Link (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., /holdings or https://arthavi.com"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl py-2 px-3.5 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 accent-indigo-600 cursor-pointer"
                />
                <label htmlFor="isActiveCheck" className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 select-none font-medium cursor-pointer">
                  Make this update Active immediately (triggers user announcements)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-xl text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs sm:text-sm text-white font-bold transition-colors cursor-pointer shadow-sm"
                >
                  {formSubmitting ? "Saving..." : "Save Update"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
