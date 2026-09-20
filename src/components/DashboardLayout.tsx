"use client";

import { useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  MessageSquare,
  MessageSquarePlus,
  MoreHorizontal,
  LogOut,
  Shield,
  Search,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { ThemeToggle } from "./ThemeProvider";

function getPageTitle(pathname: string): { title: string; section: string } {
  if (pathname === "/") return { title: "Dashboard Overview", section: "Overview" };
  if (pathname.startsWith("/users/")) return { title: "User Details & Portfolios", section: "Core Operations" };
  if (pathname.startsWith("/users")) return { title: "Users Directory", section: "Core Operations" };
  if (pathname.startsWith("/master-data")) return { title: "Master Market Data", section: "Core Operations" };
  if (pathname.startsWith("/referrals")) return { title: "Referrals & Viral Loops", section: "Core Operations" };
  if (pathname.startsWith("/goals")) return { title: "User Financial Goals", section: "Core Operations" };
  if (pathname.startsWith("/donations")) return { title: "Support & UPI Intent", section: "Core Operations" };
  if (pathname.startsWith("/buy-signals")) return { title: "Recommended Signals", section: "Growth & Intelligence" };
  if (pathname.startsWith("/predictions")) return { title: "Market Predictions", section: "Growth & Intelligence" };
  if (pathname.startsWith("/analytics")) return { title: "Platform Analytics", section: "Growth & Intelligence" };
  if (pathname.startsWith("/activity")) return { title: "Activity & Retention", section: "Growth & Intelligence" };
  if (pathname.startsWith("/chats")) return { title: "AI Conversations Inbox", section: "Platform Controls" };
  if (pathname.startsWith("/feedback")) return { title: "Feedback & Suggestions", section: "Platform Controls" };
  if (pathname.startsWith("/notifications")) return { title: "Mailing List & Push Studio", section: "Platform Controls" };
  if (pathname.startsWith("/updates")) return { title: "What's New & Changelogs", section: "Platform Controls" };
  if (pathname.startsWith("/settings")) return { title: "Admin & Security Settings", section: "Platform Controls" };
  return { title: "Arthavi Admin Kendra", section: "Operations" };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/login") {
    return (
      <main className="min-h-screen bg-[#070a13] text-slate-100 flex items-center justify-center p-4">
        {children}
      </main>
    );
  }

  const { title, section } = getPageTitle(pathname);

  const handleLogout = () => {
    document.cookie = "admin_token=; path=/; max-age=0; SameSite=Lax";
    router.push("/login");
    router.refresh();
  };

  const mobileNavItems = [
    { href: "/", label: "Home", icon: LayoutDashboard },
    { href: "/users", label: "Users", icon: Users },
    { href: "/feedback", label: "Feedback", icon: MessageSquarePlus },
    { href: "/chats", label: "Chats", icon: MessageSquare },
  ];

  return (
    <div className="flex bg-[#f8fafc] dark:bg-[#070a13] min-h-screen text-slate-900 dark:text-slate-100 relative isolate transition-colors duration-200">
      {/* ── MOBILE TOP BAR ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] z-40 px-4 flex justify-between items-center shadow-xs">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            A
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
            Arthavi <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xs">Admin</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <ThemeToggle compact />
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle navigation drawer"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── SIDEBAR DRAWER ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 transform h-[100dvh]
          ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"} 
          md:relative md:translate-x-0 md:shadow-none md:block
          transition-transform duration-300 ease-in-out
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* ── MOBILE BACKDROP OVERLAY ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 w-full min-w-0 flex flex-col pt-14 md:pt-0 pb-16 md:pb-0 overflow-y-auto h-[100dvh]">
        {/* Desktop Top Header Bar */}
        <div className="hidden md:flex h-16 bg-white/70 dark:bg-[#090d16]/70 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] px-8 items-center justify-between sticky top-0 z-30 transition-colors duration-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
              <span>{section}</span>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-300">{title}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Link to live user app */}
            <a
              href="https://app.arthavi.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-colors inline-flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live App
            </a>

            <ThemeToggle compact />

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/15 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Page Body Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      {/* ── MOBILE BOTTOM QUICK BAR ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/[0.08] z-30 px-3 flex items-center justify-around shadow-lg">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon size={18} className={isActive ? "stroke-[2.5]" : "stroke-[1.75]"} />
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}

        {/* More drawer trigger */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          <MoreHorizontal size={18} />
          <span className="mt-0.5">More</span>
        </button>
      </nav>
    </div>
  );
}
