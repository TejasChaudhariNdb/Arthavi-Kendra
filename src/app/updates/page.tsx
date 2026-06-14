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
      // Optimistically update list
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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">What&apos;s New</h1>
            <p className="text-sm text-gray-400">Compose and publish platform changelogs & feature announcement cards</p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shrink-0 shadow-md shadow-emerald-900/10"
        >
          <Plus size={18} />
          Create Update
        </button>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total Changelogs</p>
          <p className="text-3xl font-bold font-mono text-white mt-1">{updates.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Active Alerts</p>
          <p className="text-3xl font-bold font-mono text-emerald-400 mt-1">{activeCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Inactive Items</p>
          <p className="text-3xl font-bold font-mono text-gray-400 mt-1">
            {updates.length - activeCount}
          </p>
        </div>
      </div>

      {/* Alert Messaging */}
      {statusMsg && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg text-sm border ${
            statusMsg.type === "success"
              ? "bg-emerald-900/20 border-emerald-900/50 text-emerald-400"
              : "bg-red-900/20 border-red-900/50 text-red-400"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{statusMsg.text}</span>
        </div>
      )}

      {/* Feed list */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Retrieving platform changelogs...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-400 border border-dashed border-red-900/30 rounded-xl">
          {error}
        </div>
      ) : updates.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border border-dashed border-gray-800 rounded-xl">
          No updates composed yet. Click &quot;Create Update&quot; to begin.
        </div>
      ) : (
        <div className="space-y-6">
          {updates.map((update) => (
            <div
              key={update.id}
              className={`bg-gray-900 border ${
                update.is_active ? "border-gray-800 hover:border-emerald-500/20" : "border-gray-900/40 opacity-75"
              } rounded-xl p-6 shadow-sm transition-all duration-200`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white leading-tight">{update.title}</h2>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        update.is_active
                          ? "bg-emerald-900/30 text-emerald-400 border border-emerald-900/50"
                          : "bg-gray-800 text-gray-400 border border-gray-700"
                      }`}
                    >
                      {update.is_active ? (
                        <>
                          <CheckCircle size={10} /> Active
                        </>
                      ) : (
                        <>
                          <XCircle size={10} /> Inactive
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>Created {formatDate(update.created_at)}</span>
                  </div>
                </div>

                {/* Quick actions panel */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(update)}
                    className="p-2 hover:bg-gray-850 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="Edit Announcement"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(update)}
                    className={`p-2 hover:bg-gray-850 rounded-lg transition-colors ${
                      update.is_active ? "text-emerald-400" : "text-gray-500 hover:text-emerald-400"
                    }`}
                    title={update.is_active ? "Deactivate Announcement" : "Activate Announcement"}
                  >
                    {update.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                </div>
              </div>

              {/* Description body */}
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mb-4 bg-gray-950/40 p-4 rounded-lg border border-gray-800/50">
                {update.description}
              </p>

              {/* CTA link preview */}
              {update.cta_link && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">CTA Action:</span>
                  <span className="bg-gray-950 px-2 py-1 rounded font-mono text-gray-300">
                    {update.cta_text || "Explore"}
                  </span>
                  <span className="text-gray-500">→</span>
                  <a
                    href={update.cta_link}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-emerald-400 hover:underline flex items-center gap-1 transition-colors"
                  >
                    {update.cta_link}
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Compose/Edit Modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? "Edit Changelog Update" : "Create Changelog Update"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Update Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Family Portfolio V1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 px-3.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Update Description
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Describe the new features. Supports markdown lists or multi-line paragraphs."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 px-3.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    CTA Action Text (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Explore"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    maxLength={30}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 px-3.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    CTA Action Link (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., /holdings or https://google.com"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 px-3.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-gray-800 bg-gray-950 text-emerald-600 focus:ring-0"
                />
                <label htmlFor="isActiveCheck" className="text-sm text-gray-300 select-none">
                  Make this update Active immediately (triggers user announcements)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-800 hover:bg-gray-850 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 disabled:cursor-not-allowed rounded-lg text-sm text-white font-medium transition-colors"
                >
                  {formSubmitting ? "Saving..." : "Save Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
