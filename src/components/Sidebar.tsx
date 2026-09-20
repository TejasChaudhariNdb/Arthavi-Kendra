"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  LineChart,
  MessageSquare,
  Database,
  X,
  Gift,
  Bell,
  MessageSquarePlus,
  Target,
  CandlestickChart,
  Activity,
  TrendingUp,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { clsx } from "clsx";
import { ThemeToggle } from "./ThemeProvider";

interface NavGroup {
  title: string;
  items: Array<{
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Core Operations",
    items: [
      { href: "/users", label: "Users & Portfolios", icon: Users },
      { href: "/master-data", label: "Master Data", icon: Database },
      { href: "/referrals", label: "Referrals", icon: Gift },
      { href: "/goals", label: "Financial Goals", icon: Target },
      { href: "/donations", label: "Support & UPI", icon: CreditCard },
    ],
  },
  {
    title: "Growth & Intelligence",
    items: [
      { href: "/buy-signals", label: "Recommended Signals", icon: CandlestickChart },
      { href: "/predictions", label: "Market Predictions", icon: TrendingUp },
      { href: "/analytics", label: "Platform Analytics", icon: LineChart },
      { href: "/activity", label: "Activity & Retention", icon: Activity },
    ],
  },
  {
    title: "Platform Controls",
    items: [
      { href: "/chats", label: "AI Conversations", icon: MessageSquare },
      { href: "/feedback", label: "Feedback & Suggestions", icon: MessageSquarePlus },
      { href: "/notifications", label: "Mailing & Push", icon: Bell },
      { href: "/updates", label: "What's New", icon: Sparkles },
      { href: "/settings", label: "Admin & Security", icon: Settings },
    ],
  },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="h-full w-64 bg-white dark:bg-[#090d16] text-slate-800 dark:text-slate-200 flex flex-col border-r border-slate-200 dark:border-white/[0.08] shadow-xs md:shadow-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <span className="text-lg">A</span>
          </div>
          <div>
            <div className="font-bold text-base text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-1.5">
              Arthavi <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-semibold border border-indigo-200 dark:border-indigo-500/20">Kendra</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Admin Operations Portal</p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <h3 className="px-3 text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              {group.title}
            </h3>
            <div className="space-y-0.5 pt-0.5">
              {group.items.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={clsx(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        size={18}
                        className={clsx(
                          "shrink-0 transition-transform group-hover:scale-105",
                          isActive
                            ? "text-white"
                            : "text-slate-400 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                        )}
                      />
                      <span className="truncate">{link.label}</span>
                    </div>

                    {link.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                        {link.badge}
                      </span>
                    )}

                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white ml-2 shrink-0 animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Controls & Theme Switcher */}
      <div className="p-3 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#070a13] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              Prod Live
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              v1.2.0 • Arthavi
            </p>
          </div>
        </div>

        <ThemeToggle compact />
      </div>
    </div>
  );
}
