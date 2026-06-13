import React from "react";
import { Users, Heart } from "lucide-react";

interface FamilyDynamicsSectionProps {
  stats: {
    totalUsers: number;
    totalProfiles?: number;
    averageProfilesPerUser?: number;
    profileTypesBreakdown?: Record<string, number>;
    profileRelationsBreakdown?: Record<string, number>;
  };
}

const RELATION_METADATA: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  SELF: { label: "Self", bg: "bg-blue-900/30", text: "text-blue-400", dot: "bg-blue-400" },
  SPOUSE: { label: "Spouse", bg: "bg-pink-900/30", text: "text-pink-400", dot: "bg-pink-400" },
  MOTHER: { label: "Mother", bg: "bg-purple-900/30", text: "text-purple-400", dot: "bg-purple-400" },
  FATHER: { label: "Father", bg: "bg-indigo-900/30", text: "text-indigo-400", dot: "bg-indigo-400" },
  CHILD: { label: "Child", bg: "bg-emerald-900/30", text: "text-emerald-400", dot: "bg-emerald-400" },
  OTHER: { label: "Other", bg: "bg-gray-800", text: "text-gray-400", dot: "bg-gray-400" },
};

const PROFILE_TYPE_METADATA: Record<string, { label: string; bg: string; text: string; fill: string }> = {
  INDIVIDUAL: { label: "Individual", bg: "bg-amber-900/20", text: "text-amber-400", fill: "bg-amber-400" },
  JOINT: { label: "Joint", bg: "bg-teal-900/20", text: "text-teal-400", fill: "bg-teal-400" },
  CUSTOM: { label: "Custom", bg: "bg-violet-900/20", text: "text-violet-400", fill: "bg-violet-400" },
};

export const FamilyDynamicsSection: React.FC<FamilyDynamicsSectionProps> = ({ stats }) => {
  const totalProfiles = stats.totalProfiles || 0;
  const averageProfiles = stats.averageProfilesPerUser || 0;
  const typesBreakdown = stats.profileTypesBreakdown || {};
  const relationsBreakdown = stats.profileRelationsBreakdown || {};

  // Find standard plus fallback categories
  const relationsList = Object.keys(RELATION_METADATA).map((key) => ({
    key,
    count: relationsBreakdown[key] || 0,
    meta: RELATION_METADATA[key],
  }));

  // Handle any relation not defined in metadata
  Object.keys(relationsBreakdown).forEach((key) => {
    if (!RELATION_METADATA[key]) {
      relationsList.push({
        key,
        count: relationsBreakdown[key],
        meta: {
          label: key.charAt(0) + key.slice(1).toLowerCase(),
          bg: "bg-gray-800",
          text: "text-gray-400",
          dot: "bg-gray-400",
        },
      });
    }
  });

  const typesList = Object.keys(PROFILE_TYPE_METADATA).map((key) => ({
    key,
    count: typesBreakdown[key] || 0,
    meta: PROFILE_TYPE_METADATA[key],
  }));

  Object.keys(typesBreakdown).forEach((key) => {
    if (!PROFILE_TYPE_METADATA[key]) {
      typesList.push({
        key,
        count: typesBreakdown[key],
        meta: {
          label: key.charAt(0) + key.slice(1).toLowerCase(),
          bg: "bg-gray-800",
          text: "text-gray-400",
          fill: "bg-gray-400",
        },
      });
    }
  });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide flex items-center gap-2">
          <Users size={16} className="text-emerald-400" /> Family Dynamics Summary
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Metrics Column */}
        <div className="space-y-4 flex flex-col justify-center">
          <div className="bg-gray-800/30 border border-gray-800 rounded-lg p-5 flex items-center gap-4 hover:border-emerald-500/20 transition-all">
            <div className="p-3 bg-emerald-950 text-emerald-400 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Family Profiles</p>
              <h4 className="text-3xl font-mono font-bold text-white mt-1">{totalProfiles}</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">Across all registered user accounts</p>
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-800 rounded-lg p-5 flex items-center gap-4 hover:border-emerald-500/20 transition-all">
            <div className="p-3 bg-teal-950 text-teal-400 rounded-xl">
              <Heart size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Average Profiles / User</p>
              <h4 className="text-3xl font-mono font-bold text-white mt-1">{averageProfiles.toFixed(1)}</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">Indicates family unit complexity</p>
            </div>
          </div>
        </div>

        {/* Profile Types Breakdown Column */}
        <div className="bg-gray-850 border border-gray-800/60 rounded-lg p-5">
          <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">
            Profile Types Distribution
          </h4>
          <div className="space-y-4">
            {typesList.map(({ key, count, meta }) => {
              const pct = totalProfiles > 0 ? (count / totalProfiles) * 100 : 0;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300 font-medium">{meta.label}</span>
                    <span className="text-gray-400 font-mono">
                      {count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`${meta.fill} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {totalProfiles === 0 && (
              <p className="text-xs text-gray-500 text-center py-6">No profile data available.</p>
            )}
          </div>
        </div>

        {/* Family Relations Breakdown Column */}
        <div className="bg-gray-850 border border-gray-800/60 rounded-lg p-5">
          <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">
            Family Relations Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {relationsList.map(({ key, count, meta }) => {
              const pct = totalProfiles > 0 ? (count / totalProfiles) * 100 : 0;
              return (
                <div
                  key={key}
                  className="p-3 bg-gray-800/40 border border-gray-800 rounded-lg flex flex-col justify-between hover:bg-gray-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    <span className="text-xs text-gray-300 font-medium">{meta.label}</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-auto">
                    <span className="text-lg font-bold font-mono text-white">{count}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
            {totalProfiles === 0 && (
              <p className="text-xs text-gray-500 text-center col-span-2 py-6">No relation data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
