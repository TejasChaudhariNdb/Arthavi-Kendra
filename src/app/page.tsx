import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NAV_GROUPS } from "@/lib/nav";

// Landing page after login: links only, no backend calls, so opening the admin costs no queries.
export default function HomePage() {
  const hour = Number(
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false })
  );
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{greeting}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">Where do you want to go?</p>
      </header>

      {NAV_GROUPS.map((group) => {
        const items = group.items.filter((i) => i.href !== "/");
        if (items.length === 0) return null;
        return (
          <section key={group.title} className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {group.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {items.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0d121f] hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-sm transition-all"
                >
                  <span className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="flex-1 min-w-0 font-semibold text-sm text-slate-800 dark:text-slate-200 leading-snug">
                    {label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
