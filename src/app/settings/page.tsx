import { fetchAdminProfile } from "@/lib/api";
import CreateAdminForm from "@/components/CreateAdminForm";
import { User, Shield, Calendar, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let profile = null;
  try {
    profile = await fetchAdminProfile();
  } catch (e) {
    // If fetching profile fails (e.g. token expired), we might want to redirect or show error
    // Since middleware protects this route, it's likely a backend error or transient issue
    return (
      <div className="p-8 text-center">
        <div className="text-red-400 mb-4 bg-red-900/20 p-4 rounded-lg inline-block">
          Failed to load profile details. Please try refreshing or login again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">
          Manage your admin profile and platform access controls
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gray-950/50 p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
            <Shield className="text-emerald-500" size={20} /> Current Admin
            Profile
          </h2>
          <div className="text-xs font-mono text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
            ID: #{profile.id}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Full Name
            </div>
            <div className="text-white font-medium flex items-center gap-2 text-lg">
              <User size={18} className="text-gray-400" /> {profile.full_name}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Email
            </div>
            <div className="text-white font-medium flex items-center gap-2 text-lg">
              <Mail size={18} className="text-gray-400" /> {profile.email}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Joined At
            </div>
            <div className="text-white font-medium flex items-center gap-2 text-lg">
              <Calendar size={18} className="text-gray-400" />{" "}
              {profile.created_at || "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Create Admin Section */}
      <CreateAdminForm />
    </div>
  );
}
