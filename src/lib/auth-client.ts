const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof document !== "undefined") {
    // Basic regex to parse cookie
    const match = document.cookie.match(new RegExp("(^| )admin_token=([^;]+)"));
    if (match) return match[2];
  }
  return "";
}

export async function loginAdmin(credentials: {
  username: string;
  password: string;
}) {
  const res = await fetch(`${API_URL}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(credentials),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function registerAdmin(data: {
  email: string;
  password: string;
  full_name: string;
}) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

export async function impersonateUser(userId: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/users/${userId}/impersonate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to impersonate");
  return res.json();
}

export async function deletePortfolio(portfolioId: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/portfolios/${portfolioId}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to delete portfolio");
  }
  return res.json();
}

export async function updateStock(
  symbol: string,
  updates: Record<string, unknown>,
) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/stocks/${symbol}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function fetchStocksClient(page = 1, limit = 50, search = "") {
  const token = getToken();
  const skip = (page - 1) * limit;
  const res = await fetch(
    `${API_URL}/admin/stocks/?skip=${skip}&limit=${limit}&search=${search}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );
  if (!res.ok) throw new Error("Failed to fetch stocks");
  return res.json();
}

export async function fetchRefreshStatusClient() {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/stocks/refresh-status`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export async function sendNotification(data: {
  title: string;
  body: string;
  send_to_all: boolean;
  user_ids?: number[];
  user_id?: number | null;
}) {
  const token = getToken();
  const res = await fetch(`${API_URL}/notifications/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to send notification");
  }
  return res.json();
}

export async function exportUsersCsv() {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/users/export`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to export users CSV");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function exportSlippingUsersCsv(days: number = 5) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/users/export-slipping?days=${days}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to export slipping users CSV");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `slipping_users_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function fetchAdminUpdatesClient() {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/updates`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch platform updates");
  return res.json();
}

export async function createAdminUpdateClient(data: {
  title: string;
  description: string;
  cta_text?: string;
  cta_link?: string;
  is_active: boolean;
}) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/updates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.detail || "Failed to create update");
  }
  return res.json();
}

export async function updateAdminUpdateClient(
  id: number,
  data: {
    title: string;
    description: string;
    cta_text?: string;
    cta_link?: string;
    is_active: boolean;
  }
) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/updates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.detail || "Failed to update platform announcement");
  }
  return res.json();
}

export async function fetchMailingListClient(params: {
  skip?: number;
  limit?: number;
  search?: string;
  status_filter?: string;
} = {}) {
  const token = getToken();
  const query = new URLSearchParams();
  if (params.skip !== undefined) query.set("skip", String(params.skip));
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.status_filter) query.set("status_filter", params.status_filter);

  const res = await fetch(`${API_URL}/admin/mailing-list?${query.toString()}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch mailing list");
  return res.json();
}

export async function fetchMailingListStatsClient() {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/mailing-list/stats`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch mailing list stats");
  return res.json();
}

export async function fetchUserNotificationPreferencesClient(userId: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/users/${userId}/notification-preferences`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch user notification preferences");
  return res.json();
}

export async function updateUserNotificationPreferencesClient(userId: number, data: any) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/users/${userId}/notification-preferences`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.detail || "Failed to update notification preferences");
  }
  return res.json();
}

export async function bulkSuppressEmailsClient(emails: string[], reason?: string, diagnostic?: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/mailing-list/suppress-bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ emails, reason, diagnostic }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.detail || "Failed to bulk suppress emails");
  }
  return res.json();
}

export async function fetchActivityDashboardBundleClient() {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/metrics/activity-dashboard-bundle`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.detail || "Failed to fetch activity dashboard bundle");
  }
  return res.json();
}

// ==========================================
// Email Campaigns & User Outreach API Client
// ==========================================

export async function fetchCampaignsClient(params?: {
  search?: string;
  status?: string;
  campaign_type?: string;
  skip?: number;
  limit?: number;
}) {
  const token = getToken();
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.campaign_type) searchParams.set("campaign_type", params.campaign_type);
  if (params?.skip !== undefined) searchParams.set("skip", params.skip.toString());
  if (params?.limit !== undefined) searchParams.set("limit", params.limit.toString());

  const res = await fetch(`${API_URL}/admin/campaigns?${searchParams.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to fetch email campaigns");
  }
  return res.json();
}

export async function createCampaignClient(data: any) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to create campaign");
  }
  return res.json();
}

export async function fetchCampaignDetailClient(campaignId: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns/${campaignId}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to fetch campaign detail");
  }
  return res.json();
}

export async function updateCampaignClient(campaignId: number, data: any) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns/${campaignId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to update campaign");
  }
  return res.json();
}

export async function deleteCampaignClient(campaignId: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns/${campaignId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to delete campaign");
  }
  return res.json();
}

export async function duplicateCampaignClient(campaignId: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns/${campaignId}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to duplicate campaign");
  }
  return res.json();
}

export async function cancelCampaignClient(campaignId: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns/${campaignId}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to cancel campaign");
  }
  return res.json();
}

export async function retryFailedCampaignClient(campaignId: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns/${campaignId}/retry-failed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to retry failed recipients");
  }
  return res.json();
}

export async function validateRecipientsClient(data: {
  manual_emails?: string;
  selected_user_ids?: number[];
  segment_type?: string;
  campaign_type?: string;
}) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns/validate-recipients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to validate recipients");
  }
  return res.json();
}

export async function previewEmailClient(data: {
  subject: string;
  html_body: string;
  preview_text?: string;
  cta_config?: any;
  sample_recipient?: any;
  is_marketing?: boolean;
}) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns/preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to render email preview");
  }
  return res.json();
}

export async function sendTestEmailClient(data: {
  test_emails: string[];
  subject: string;
  html_body: string;
  preview_text?: string;
  sender_name?: string;
  sender_email?: string;
  reply_to_email?: string;
  cta_config?: any;
}) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns/test-send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to send test email");
  }
  return res.json();
}

export async function sendCampaignClient(campaignId: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns/${campaignId}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to queue campaign send");
  }
  return res.json();
}

export async function fetchCampaignRecipientsClient(
  campaignId: number,
  params?: { status?: string; search?: string; skip?: number; limit?: number }
) {
  const token = getToken();
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.skip !== undefined) searchParams.set("skip", params.skip.toString());
  if (params?.limit !== undefined) searchParams.set("limit", params.limit.toString());

  const res = await fetch(`${API_URL}/admin/campaigns/${campaignId}/recipients?${searchParams.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to fetch campaign recipients");
  }
  return res.json();
}

export async function fetchAllDeliveryLogsClient(params?: {
  status?: string;
  search?: string;
  campaign_id?: number;
  skip?: number;
  limit?: number;
}) {
  const token = getToken();
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.campaign_id) searchParams.set("campaign_id", params.campaign_id.toString());
  if (params?.skip !== undefined) searchParams.set("skip", params.skip.toString());
  if (params?.limit !== undefined) searchParams.set("limit", params.limit.toString());

  const res = await fetch(`${API_URL}/admin/campaigns/logs/all?${searchParams.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to fetch delivery logs");
  }
  return res.json();
}

export async function fetchSegmentsSummaryClient() {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns/segments/summary`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to fetch segments summary");
  }
  return res.json();
}

export async function searchCampaignUsersClient(query?: string, skip?: number, limit?: number) {
  const token = getToken();
  const searchParams = new URLSearchParams();
  if (query) searchParams.set("query", query);
  if (skip !== undefined) searchParams.set("skip", skip.toString());
  if (limit !== undefined) searchParams.set("limit", limit.toString());

  const res = await fetch(`${API_URL}/admin/campaigns/users/search?${searchParams.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to search campaign users");
  }
  return res.json();
}

export async function fetchTemplatesClient() {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns/templates/list`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to fetch email templates");
  }
  return res.json();
}

export async function createTemplateClient(data: any) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns/templates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to create template");
  }
  return res.json();
}

export async function fetchTemplateDetailClient(templateId: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns/templates/${templateId}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to fetch template detail");
  }
  return res.json();
}

export async function updateTemplateClient(templateId: number, data: any) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns/templates/${templateId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to update template");
  }
  return res.json();
}

export async function deleteTemplateClient(templateId: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/campaigns/templates/${templateId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to delete template");
  }
  return res.json();
}




