import { fetchAdminProfile } from "@/lib/api";
import CreateAdminForm from "@/components/CreateAdminForm";
import { User, Shield, Calendar, Mail, Settings, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let profile = null;
  try {
    profile = await fetchAdminProfile();
  } catch (e) {
    return (
      <Card className="p-8 text-center border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-2 text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm font-semibold">Failed to load admin profile details</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Please try refreshing or login again.</p>
        </div>
      </Card>
    );
  }

  const joinedAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "N/A";

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Settings &amp; Access Controls
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage your administrator credentials and platform access accounts
            </p>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] px-5 py-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Current Admin Profile
            </CardTitle>
            <Badge variant="neutral" size="sm" className="font-mono">
              ID: #{profile.id}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
              Full Name
            </div>
            <div className="text-slate-900 dark:text-white font-semibold flex items-center gap-2 text-base sm:text-lg">
              <User className="w-4 h-4 text-slate-400" /> {profile.full_name}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
              Email Address
            </div>
            <div className="text-slate-900 dark:text-white font-semibold flex items-center gap-2 text-base sm:text-lg">
              <Mail className="w-4 h-4 text-slate-400" /> {profile.email}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
              Joined Timestamp
            </div>
            <div className="text-slate-900 dark:text-white font-semibold flex items-center gap-2 text-base sm:text-lg font-mono">
              <Calendar className="w-4 h-4 text-slate-400" /> {joinedAt}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Admin Section */}
      <CreateAdminForm />
    </div>
  );
}
