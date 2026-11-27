"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Bell, Mail, BellOff, CalendarDays, X } from "lucide-react";
import { sendNotification } from "@/lib/auth-client";

interface TodayUser {
  id: number;
  email: string;
  name: string;
  signup_date: string | null;
  last_active_at: string | null;
  lifetime_active_days: number;
  is_new: boolean;
  has_push: boolean;
}

interface ListUser {
  id: number;
  email: string;
  name: string;
  signup_date: string | null;
  last_active_date: string | null;
  lifetime_active_days: number;
  days_inactive?: number;
  has_push: boolean;
  last_contact_channel: "push" | "email" | null;
  last_contact_at: string | null;
}

interface ContactRow {
  id: number;
  email: string;
  name: string;
  channel: "push" | "email";
  sent_at: string | null;
  returned_on: string | null;
}

interface Summary {
  date: string;
  new_today: number;
  new_yesterday: number;
  new_7d: number;
  active_today: number;
  active_excl_new: Record<"1" | "2" | "3", number>;
  active_today_with_push: number;
  active_yesterday: number;
  wau: number;
  mau: number;
  stickiness_pct: number;
  yesterday_new_returned_today: number;
  new_activated: number;
}

interface DailyUsersData {
  today: string;
  dates: string[];
  summaries: Summary[];
  users_date: string;
  trend: { date: string; active: number; new: number }[];
  today_users: TodayUser[];
  dormant_users: ListUser[];
  not_set_up_users: ListUser[];
  contact_stats: Partial<Record<"push" | "email", { contacted: number; measurable: number; returned: number }>>;
  contacts: ContactRow[];
}

const MAX_SEND = 50;
const box =
  "bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-4 shadow-xs";
const th = "text-left text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold py-2 px-2";
const td = "py-2 px-2 text-xs text-slate-700 dark:text-slate-300";

/** Parse an API timestamp; trims microseconds and a doubled zone (old iOS Safari shows these as "Invalid Date"). */
const toDate = (iso: string | null | undefined) => {
  if (!iso) return null;
  const d = new Date(iso.replace(/(\.\d{3})\d+/, "$1").replace(/[+-]00:00Z$/, "Z"));
  return isNaN(d.getTime()) ? null : d;
};

// Built from parts, so no string parsing differences between browsers.
const fmtDate = (d: string) => {
  const [y, m, day] = d.split("-").map(Number);
  const x = new Date(y, m - 1, day);
  return isNaN(x.getTime()) ? d : x.toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });
};

type SortVal = string | number | boolean | null | undefined;
type SortState = { key: string; dir: 1 | -1 } | null;

/** Click a header: ascending, then descending, then back to the default order. Empty values always last. */
function useSorted<T>(rows: T[], get: Record<string, (r: T) => SortVal>) {
  const [sort, setSort] = useState<SortState>(null);
  const sorted = !sort
    ? rows
    : [...rows].sort((a, b) => {
        const x = get[sort.key](a);
        const y = get[sort.key](b);
        if (x == null || x === "" || y == null || y === "") return x == null || x === "" ? (y == null || y === "" ? 0 : 1) : -1;
        const c = typeof x === "string" && typeof y === "string" ? x.localeCompare(y) : Number(x) - Number(y);
        return c * sort.dir;
      });
  const onSort = (key: string) =>
    setSort((cur) => (cur?.key !== key ? { key, dir: 1 } : cur.dir === 1 ? { key, dir: -1 } : null));
  return { sorted, sort, onSort };
}

function SortTh({ label, k, sort, onSort }: { label: string; k: string; sort: SortState; onSort: (k: string) => void }) {
  const active = sort?.key === k;
  return (
    <th className={th} aria-sort={active ? (sort!.dir === 1 ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort(k)}
        className={`inline-flex items-center gap-1 uppercase tracking-wider cursor-pointer hover:text-indigo-500 ${active ? "text-indigo-600 dark:text-indigo-400" : ""}`}
      >
        {label}
        <span aria-hidden className="text-[9px]">{active ? (sort!.dir === 1 ? "▲" : "▼") : "↕"}</span>
      </button>
    </th>
  );
}

/** One card; with several dates the first is the big number and the rest are compared against it. */
function Stat({
  label,
  rows,
  sub,
  children,
}: {
  label: string;
  rows: { date: string; value: number; display?: string }[];
  sub?: string;
  children?: React.ReactNode;
}) {
  const [main, ...rest] = rows;
  return (
    <div className={box}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">{label}</p>
        {children}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{main.display ?? main.value}</p>
      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">{fmtDate(main.date)}</p>
      {rest.map((r) => {
        const diff = Math.round((main.value - r.value) * 10) / 10;
        return (
          <div key={r.date} className="flex items-center justify-between text-[11px] mt-1 border-t border-slate-100 dark:border-white/[0.05] pt-1">
            <span className="text-slate-500 dark:text-slate-400">{fmtDate(r.date)}</span>
            <span className="tabular-nums text-slate-700 dark:text-slate-300">
              {r.display ?? r.value}
              {diff !== 0 && (
                <span className={`ml-1.5 ${diff > 0 ? "text-emerald-600" : "text-rose-500"}`} title={`${fmtDate(main.date)} vs ${fmtDate(r.date)}`}>
                  {diff > 0 ? "▲" : "▼"}
                  {Math.abs(diff)}
                </span>
              )}
            </span>
          </div>
        );
      })}
      {sub && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

const shift = (d: string, days: number) => {
  const x = new Date(`${d}T00:00:00Z`);
  x.setUTCDate(x.getUTCDate() + days);
  return x.toISOString().slice(0, 10);
};

const timeIST = (iso: string | null) =>
  toDate(iso)?.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }) ?? "—";

export default function DailyUsersClient({ data }: { data: DailyUsersData }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, startTransition] = useTransition();
  const sums = data.summaries;
  const s = sums[0];
  const isToday = data.dates.length === 1 && data.dates[0] === data.today;

  const setDates = (next: string[]) => {
    const uniq = [...new Set(next)].filter((d) => d && d <= data.today).slice(0, 7);
    startTransition(() => router.push(uniq.length ? `${pathname}?dates=${uniq.join(",")}` : pathname));
  };
  const rowsOf = (pick: (x: Summary) => number, display?: (x: Summary) => string) =>
    sums.map((x) => ({ date: x.date, value: pick(x), display: display?.(x) }));
  const [exclDays, setExclDays] = useState<"1" | "2" | "3">("1");
  const [todayNewOnly, setTodayNewOnly] = useState(false);
  const todayRows = todayNewOnly ? data.today_users.filter((u) => u.is_new) : data.today_users;
  const today = useSorted(todayRows, {
    name: (u) => u.name.toLowerCase(),
    signup: (u) => u.signup_date,
    seen: (u) => u.last_active_at,
    days: (u) => u.lifetime_active_days,
    push: (u) => u.has_push,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Daily Users</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Dates are IST. Counts exclude deactivated accounts. Pick several dates to compare them; the first one is the main
          number and the others show the change against it.
        </p>
      </div>

      {/* Date filter */}
      <div className={`${box} flex flex-wrap items-center gap-2 ${loading ? "opacity-60" : ""}`}>
        <CalendarDays size={16} className="text-indigo-500" aria-hidden />
        {data.dates.map((d, i) => (
          <span
            key={d}
            className={`text-xs rounded-full px-2.5 py-1 flex items-center gap-1 ${
              i === 0
                ? "bg-indigo-600 text-white"
                : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
            }`}
          >
            {fmtDate(d)}
            {data.dates.length > 1 && (
              <button
                onClick={() => setDates(data.dates.filter((x) => x !== d))}
                aria-label={`Remove ${d}`}
                className="cursor-pointer opacity-80 hover:opacity-100"
              >
                <X size={12} />
              </button>
            )}
          </span>
        ))}
        <input
          type="date"
          max={data.today}
          value=""
          onChange={(e) => e.target.value && setDates([...data.dates, e.target.value])}
          aria-label="Add a date to compare"
          disabled={data.dates.length >= 7}
          className="text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-transparent px-2 py-1 text-slate-600 dark:text-slate-300"
        />
        <span className="text-[11px] text-slate-400">add date</span>
        <div className="flex flex-wrap gap-1.5 ml-auto">
          {[
            ["Today", () => setDates([data.today])],
            ["Yesterday", () => setDates([shift(data.today, -1)])],
            ["+ day before", () => setDates([...data.dates, shift(data.dates[0], -1)])],
            ["+ same day last week", () => setDates([...data.dates, shift(data.dates[0], -7)])],
            ["Last 7 days", () => setDates([0, 1, 2, 3, 4, 5, 6].map((n) => shift(data.today, -n)))],
          ].map(([label, fn]) => (
            <button
              key={label as string}
              onClick={fn as () => void}
              className="text-[11px] rounded-md border border-slate-200 dark:border-white/10 px-2 py-1 text-slate-600 dark:text-slate-300 hover:border-indigo-400 cursor-pointer"
            >
              {label as string}
            </button>
          ))}
        </div>
      </div>

      {/* Main cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat
          label="New users"
          rows={rowsOf((x) => x.new_today)}
          sub={sums.length === 1 ? `Day before ${s.new_yesterday} · 7 days to this date ${s.new_7d}` : undefined}
        />
        <Stat
          label="Active users"
          rows={rowsOf((x) => x.active_today)}
          sub={sums.length === 1 ? `Day before ${s.active_yesterday} · ${s.active_today_with_push} reachable by push` : undefined}
        />
        <Stat
          label="Active, excl. new"
          rows={rowsOf((x) => x.active_excl_new[exclDays])}
          sub={exclDays === "1" ? "Excludes users who signed up that day" : `Excludes users who signed up in the ${exclDays} days up to that date`}
        >
          <select
            value={exclDays}
            onChange={(e) => setExclDays(e.target.value as "1" | "2" | "3")}
            aria-label="Exclude new users who signed up within"
            className="text-[11px] rounded-md border border-slate-200 dark:border-white/10 bg-transparent text-slate-600 dark:text-slate-300 px-1.5 py-0.5"
          >
            <option value="1">Same day</option>
            <option value="2">2 days</option>
            <option value="3">3 days</option>
          </select>
        </Stat>
      </div>

      {/* Useful metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <Stat
          label="New users set up"
          rows={rowsOf(
            (x) => x.new_activated,
            (x) => `${x.new_activated} / ${x.new_today}`,
          )}
          sub="New users who have added any investment (as of now)"
        />
        <Stat label="Weekly active (7d)" rows={rowsOf((x) => x.wau)} />
        <Stat label="Monthly active (30d)" rows={rowsOf((x) => x.mau)} />
        <Stat
          label="Stickiness (DAU / MAU)"
          rows={rowsOf((x) => x.stickiness_pct, (x) => `${x.stickiness_pct}%`)}
          sub="Share of the 30-day users who came that day"
        />
        <Stat
          label="Day-1 return"
          rows={rowsOf((x) => x.yesterday_new_returned_today, (x) => `${x.yesterday_new_returned_today} / ${x.new_yesterday}`)}
          sub="Previous day's signups who came back"
        />
      </div>

      {/* Line chart */}
      <div className={`${box} h-80 flex flex-col`}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
          Active vs new users — {data.trend.length} days to {fmtDate(data.trend[data.trend.length - 1]?.date ?? data.today)}
        </h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d: string) => d.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="active" name="Active users" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="new" name="New users" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's active users */}
      <div className={box}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {isToday ? "Today's" : fmtDate(data.users_date)} active users{" "}
            <span className="text-slate-400 font-normal">({todayRows.length})</span>
          </h3>
          <label className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <input type="checkbox" checked={todayNewOnly} onChange={(e) => setTodayNewOnly(e.target.checked)} />
            New only
          </label>
        </div>
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white dark:bg-[#0d121f]">
              <tr>
                <SortTh label="User" k="name" {...today} />
                <SortTh label="Signed up" k="signup" {...today} />
                <SortTh label="First seen" k="seen" {...today} />
                <SortTh label="Active days" k="days" {...today} />
                <SortTh label="Push" k="push" {...today} />
              </tr>
            </thead>
            <tbody>
              {today.sorted.map((u) => (
                <tr key={u.id} className="border-t border-slate-100 dark:border-white/[0.05]">
                  <td className={td}>
                    <Link href={`/users/${u.id}`} className="hover:text-indigo-500">
                      <span className="font-medium">{u.name}</span>
                      <span className="block text-[11px] text-slate-500">{u.email}</span>
                    </Link>
                  </td>
                  <td className={td}>
                    {u.signup_date ?? "—"}
                    {u.is_new && (
                      <span className="ml-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                  </td>
                  <td className={td}>{timeIST(u.last_active_at)}</td>
                  <td className={`${td} tabular-nums`}>{u.lifetime_active_days}</td>
                  <td className={td}>{u.has_push ? <Bell size={14} className="text-indigo-500" aria-label="Has push" /> : <BellOff size={14} className="text-slate-400" aria-label="No push" />}</td>
                </tr>
              ))}
              {todayRows.length === 0 && (
                <tr>
                  <td colSpan={5} className={`${td} text-center text-slate-400 py-6`}>No active users on this date.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ContactResults stats={data.contact_stats} contacts={data.contacts} />

      <SendList
        title="Gone quiet (as of today)"
        description="Used the app on 7+ days but not opened it in the last 7 days. Most engaged first."
        users={data.dormant_users}
        mailType="Retention / Re-engagement"
        cols={[
          ["Active days", (u) => u.lifetime_active_days],
          ["Last active", (u) => u.last_active_date],
          ["Days away", (u) => u.days_inactive],
        ]}
      />

      <SendList
        title="Signed up, not set up yet"
        description="Joined in the last 7 days and haven't added any investment yet. Newest first."
        users={data.not_set_up_users}
        mailType="Onboarding Follow-up"
        cols={[
          ["Signed up", (u) => u.signup_date],
          ["Last active", (u) => u.last_active_date],
          ["Active days", (u) => u.lifetime_active_days],
        ]}
      />
    </div>
  );
}

const HIDE_CONTACTED_DAYS = 7;
const daysAgo = (iso: string | null) => {
  const d = toDate(iso);
  return d ? Math.max(0, Math.floor((Date.now() - d.getTime()) / 86_400_000)) : null;
};
const agoText = (iso: string | null) => {
  const n = daysAgo(iso);
  return n == null ? "—" : n === 0 ? "today" : `${n}d ago`;
};
const recentlyContacted = (u: ListUser) => (daysAgo(u.last_contact_at) ?? Infinity) < HIDE_CONTACTED_DAYS;
const PushIcon = ({ on }: { on: boolean }) =>
  on ? <Bell size={14} className="text-indigo-500" aria-label="Has push" /> : <BellOff size={14} className="text-slate-400" aria-label="No push" />;

function ContactResults({ stats, contacts }: { stats: DailyUsersData["contact_stats"]; contacts: ContactRow[] }) {
  const [open, setOpen] = useState(false);
  const list = useSorted(contacts, {
    name: (c) => c.name.toLowerCase(),
    channel: (c) => c.channel,
    sent: (c) => c.sent_at,
    back: (c) => c.returned_on,
  });
  const channels = (["push", "email"] as const).filter((c) => stats[c]);
  return (
    <div className={box}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Did nudges work? (last 30 days)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Came back = opened the app on a later day than the push or email. Contacts from today aren&apos;t counted yet.
          </p>
        </div>
        <div className="flex gap-6">
          {channels.length === 0 && <span className="text-xs text-slate-400">No pushes or emails logged yet.</span>}
          {channels.map((c) => {
            const st = stats[c]!;
            const pct = st.measurable ? Math.round((st.returned * 100) / st.measurable) : 0;
            return (
              <div key={c}>
                <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">{c}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                  {pct}% <span className="text-xs font-normal text-slate-500">came back</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  {st.returned} of {st.measurable} · {st.contacted} contacted
                </p>
              </div>
            );
          })}
        </div>
      </div>
      {contacts.length > 0 && (
        <button onClick={() => setOpen(!open)} className="text-xs text-indigo-600 dark:text-indigo-400 mt-3 cursor-pointer">
          {open ? "Hide" : "Show"} who was contacted ({contacts.length})
        </button>
      )}
      {open && (
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto mt-2">
          <table className="w-full">
            <thead className="sticky top-0 bg-white dark:bg-[#0d121f]">
              <tr>
                <SortTh label="User" k="name" {...list} />
                <SortTh label="Channel" k="channel" {...list} />
                <SortTh label="Sent" k="sent" {...list} />
                <SortTh label="Came back" k="back" {...list} />
              </tr>
            </thead>
            <tbody>
              {list.sorted.map((c) => (
                <tr key={`${c.id}-${c.channel}`} className="border-t border-slate-100 dark:border-white/[0.05]">
                  <td className={td}>
                    <Link href={`/users/${c.id}`} className="hover:text-indigo-500">
                      <span className="font-medium">{c.name}</span>
                      <span className="block text-[11px] text-slate-500">{c.email}</span>
                    </Link>
                  </td>
                  <td className={`${td} capitalize`}>{c.channel}</td>
                  <td className={td}>{agoText(c.sent_at)}</td>
                  <td className={td}>
                    {c.returned_on ? <span className="text-emerald-600">✓ {fmtDate(c.returned_on)}</span> : <span className="text-slate-400">Not yet</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** A list you can push or mail (max 50 picked). Hides users contacted in the last 7 days by default. */
function SendList({
  title: heading,
  description,
  users,
  mailType,
  cols,
}: {
  title: string;
  description: string;
  users: ListUser[];
  mailType: string;
  cols: [string, (u: ListUser) => string | number | null | undefined][];
}) {
  const router = useRouter();
  const [hideContacted, setHideContacted] = useState(true);
  const hiddenCount = users.filter(recentlyContacted).length;
  const shown = (hideContacted ? users.filter((u) => !recentlyContacted(u)) : users).slice(0, MAX_SEND);
  const [selected, setSelected] = useState<Set<number>>(() => new Set(shown.map((u) => u.id)));
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [sending, setSending] = useState(false);

  const table = useSorted(shown, {
    name: (u) => u.name.toLowerCase(),
    ...Object.fromEntries(cols.map(([label, get]) => [label, get])),
    contacted: (u) => u.last_contact_at,
    push: (u) => u.has_push,
  });
  const picked = shown.filter((u) => selected.has(u.id));
  const pickedPush = picked.filter((u) => u.has_push);

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_SEND) next.add(id);
      return next;
    });

  const sendPush = async () => {
    if (!title.trim() || !body.trim() || pickedPush.length === 0) return;
    if (!confirm(`Send push to ${pickedPush.length} users?`)) return;
    setSending(true);
    setStatus(null);
    try {
      const res = await sendNotification({
        title: title.trim(),
        body: body.trim(),
        send_to_all: false,
        user_ids: pickedPush.map((u) => u.id),
      });
      setStatus({ ok: true, msg: res.message || "Push sent" });
      router.refresh(); // picks up the new contact log so these users drop off the list
    } catch (e: unknown) {
      setStatus({ ok: false, msg: e instanceof Error ? e.message : "Push failed" });
    } finally {
      setSending(false);
    }
  };

  const openMail = () => {
    // Hand the emails to the campaigns composer without putting them in the URL.
    sessionStorage.setItem(
      "campaign_prefill",
      JSON.stringify({ emails: picked.map((u) => u.email).join("\n"), campaign_type: mailType }),
    );
    router.push("/campaigns");
  };

  return (
    <div className={box}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {heading} <span className="text-slate-400 font-normal">({shown.length})</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {description} Pick up to {MAX_SEND}. {pickedPush.length < picked.length && `${picked.length - pickedPush.length} picked can only get email.`}
          </p>
        </div>
        <label className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <input type="checkbox" checked={hideContacted} onChange={(e) => setHideContacted(e.target.checked)} />
          Hide contacted in last {HIDE_CONTACTED_DAYS} days ({hiddenCount})
        </label>
      </div>

      <div className="flex flex-col lg:flex-row gap-2 mb-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Push title"
          aria-label="Push title"
          className="flex-1 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-transparent px-3 py-2"
        />
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Push message"
          aria-label="Push message"
          className="flex-[2] text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-transparent px-3 py-2"
        />
        <button
          onClick={sendPush}
          disabled={sending || !title.trim() || !body.trim() || pickedPush.length === 0}
          className="text-xs font-semibold rounded-lg bg-indigo-600 text-white px-3 py-2 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
        >
          <Bell size={14} /> Push to {pickedPush.length}
        </button>
        <button
          onClick={openMail}
          disabled={picked.length === 0}
          className="text-xs font-semibold rounded-lg border border-indigo-600 text-indigo-600 dark:text-indigo-400 px-3 py-2 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
        >
          <Mail size={14} /> Email {picked.length}
        </button>
      </div>
      {status && <p className={`text-xs mb-3 ${status.ok ? "text-emerald-600" : "text-rose-500"}`}>{status.msg}</p>}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className={th}>
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={shown.length > 0 && picked.length === shown.length}
                  onChange={(e) => setSelected(e.target.checked ? new Set(shown.map((u) => u.id)) : new Set())}
                />
              </th>
              <SortTh label="User" k="name" {...table} />
              {cols.map(([label]) => (
                <SortTh key={label} label={label} k={label} {...table} />
              ))}
              <SortTh label="Last contacted" k="contacted" {...table} />
              <SortTh label="Push" k="push" {...table} />
            </tr>
          </thead>
          <tbody>
            {table.sorted.map((u) => (
              <tr key={u.id} className="border-t border-slate-100 dark:border-white/[0.05]">
                <td className={td}>
                  <input type="checkbox" aria-label={`Select ${u.email}`} checked={selected.has(u.id)} onChange={() => toggle(u.id)} />
                </td>
                <td className={td}>
                  <Link href={`/users/${u.id}`} className="hover:text-indigo-500">
                    <span className="font-medium">{u.name}</span>
                    <span className="block text-[11px] text-slate-500">{u.email}</span>
                  </Link>
                </td>
                {cols.map(([label, render]) => (
                  <td key={label} className={`${td} tabular-nums`}>
                    {render(u) ?? "—"}
                  </td>
                ))}
                <td className={td}>
                  {u.last_contact_at ? (
                    <span className="text-[11px] text-amber-700 dark:text-amber-300">
                      {u.last_contact_channel === "push" ? "Push" : "Email"} {agoText(u.last_contact_at)}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className={td}>
                  <PushIcon on={u.has_push} />
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={cols.length + 4} className={`${td} text-center text-slate-400 py-6`}>
                  Nobody here right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
