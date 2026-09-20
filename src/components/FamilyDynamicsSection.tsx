"use client";

import React, { useState } from "react";
import { Users, Heart, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

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
  SELF: { label: "Self", bg: "bg-blue-500/10 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  SPOUSE: { label: "Spouse", bg: "bg-pink-500/10 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400", dot: "bg-pink-500" },
  MOTHER: { label: "Mother", bg: "bg-purple-500/10 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", dot: "bg-purple-500" },
  FATHER: { label: "Father", bg: "bg-indigo-500/10 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400", dot: "bg-indigo-500" },
  CHILD: { label: "Child", bg: "bg-emerald-500/10 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  OTHER: { label: "Other", bg: "bg-slate-500/10 dark:bg-gray-800", text: "text-slate-600 dark:text-gray-400", dot: "bg-slate-400" },
};

const PROFILE_TYPE_METADATA: Record<string, { label: string; text: string; fill: string }> = {
  INDIVIDUAL: { label: "Individual", text: "text-amber-600 dark:text-amber-400", fill: "bg-amber-500" },
  JOINT: { label: "Joint", text: "text-teal-600 dark:text-teal-400", fill: "bg-teal-500" },
  CUSTOM: { label: "Custom", text: "text-violet-600 dark:text-violet-400", fill: "bg-violet-500" },
};

export const FamilyDynamicsSection: React.FC<FamilyDynamicsSectionProps> = ({ stats }) => {
  const [isSectionOpen, setIsSectionOpen] = useState(true);
  const [showAllRelations, setShowAllRelations] = useState(false);

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
          bg: "bg-slate-500/10 dark:bg-gray-800",
          text: "text-slate-600 dark:text-gray-400",
          dot: "bg-slate-400",
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
          text: "text-slate-600 dark:text-gray-400",
          fill: "bg-slate-400",
        },
      });
    }
  });

  const visibleRelations = showAllRelations ? relationsList : relationsList.slice(0, 4);

  return (
    <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xs transition-colors duration-200 overflow-hidden">
      {/* Header bar with accordion toggle */}
      <button
        type="button"
        onClick={() => setIsSectionOpen(!isSectionOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Users size={18} />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold text-sm tracking-tight flex items-center gap-2">
              Family Dynamics Summary
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-medium">
                {totalProfiles} profiles • {averageProfiles.toFixed(1)} / user
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown of family unit complexity, joint accounts, and relation distributions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hidden sm:inline">
            {isSectionOpen ? "Collapse" : "Expand"}
          </span>
          <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
            {isSectionOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      {isSectionOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-3">
            {/* Core Metrics Column */}
            <div className="space-y-4 flex flex-col justify-center">
              <div className="bg-slate-50 dark:bg-[#070a13] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-4.5 flex items-center gap-4 hover:border-indigo-500/30 transition-all shadow-xs">
                <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                  <Users size={22} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    Total Family Profiles
                  </p>
                  <h4 className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {totalProfiles}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Across registered user accounts
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#070a13] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-4.5 flex items-center gap-4 hover:border-teal-500/30 transition-all shadow-xs">
                <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl shrink-0">
                  <Heart size={22} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    Avg Profiles / User
                  </p>
                  <h4 className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {averageProfiles.toFixed(1)}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Average family member count
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Types Breakdown Column */}
            <div className="bg-slate-50 dark:bg-[#070a13] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-4">
                  Profile Types Distribution
                </h4>
                <div className="space-y-3.5">
                  {typesList.map(({ key, count, meta }) => {
                    const pct = totalProfiles > 0 ? (count / totalProfiles) * 100 : 0;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-700 dark:text-slate-300">{meta.label}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-mono">
                            {count} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`${meta.fill} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {totalProfiles === 0 && (
                    <p className="text-xs text-slate-400 text-center py-6">No profile data available.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Family Relations Breakdown Column with Expand/Collapse */}
            <div className="bg-slate-50 dark:bg-[#070a13] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    Relations Breakdown ({relationsList.length})
                  </h4>
                  {relationsList.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setShowAllRelations(!showAllRelations)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {showAllRelations ? "Show fewer" : `Show all (${relationsList.length})`}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {visibleRelations.map(({ key, count, meta }) => {
                    const pct = totalProfiles > 0 ? (count / totalProfiles) * 100 : 0;
                    return (
                      <div
                        key={key}
                        className="p-2.5 bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.06] rounded-lg flex flex-col justify-between hover:border-indigo-500/30 transition-colors shadow-2xs"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                            {meta.label}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                            {count}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {totalProfiles === 0 && (
                    <p className="text-xs text-slate-400 text-center col-span-2 py-6">No relation data available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
