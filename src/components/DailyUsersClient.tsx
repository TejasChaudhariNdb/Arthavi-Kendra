"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Bell, Mail, BellOff } from "lucide-react";
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

interface DormantUser {
  id: number;
  email: string;
  name: string;
  signup_date: string | null;
  last_active_date: string | null;
  lifetime_active_days: number;
  days_inactive: number;
  has_push: boolean;
}

interface DailyUsersData {
  today: string;
  summary: {
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
  };
  trend: { date: string; active: number; new: number }[];
  today_users: TodayUser[];
  dormant_users: DormantUser[];
}

const MAX_SEND = 50;
const box =
  "bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-4 shadow-xs";
const th = "text-left text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold py-2 px-2";
const td = "py-2 px-2 text-xs text-slate-700 dark:text-slate-300";

function Stat({ label, value, sub, children }: { label: string; value: number | string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className={box}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">{label}</p>
        {children}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

const timeIST = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }) : "—";

export default function DailyUsersClient({ data }: { data: DailyUsersData }) {
  const router = useRouter();
  const s = data.summary;
  const [exclDays, setExclDays] = useState<"1" | "2" | "3">("1");
  const [todayNewOnly, setTodayNewOnly] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(() => new Set(data.dormant_users.slice(0, MAX_SEND).map((u) => u.id)));
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [sending, setSending] = useState(false);

  const todayRows = todayNewOnly ? data.today_users.filter((u) => u.is_new) : data.today_users;
  const picked = data.dormant_users.filter((u) => selected.has(u.id));
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
      JSON.stringify({ emails: picked.map((u) => u.email).join("\n"), campaign_type: "Retention / Re-engagement" }),
    );
    router.push("/campaigns");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Daily Users</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Today ({data.today}, IST). Counts exclude deactivated accounts.</p>
      </div>

      {/* Main cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="New users today" value={s.new_today} sub={`Yesterday ${s.new_yesterday} · last 7 days ${s.new_7d}`} />
        <Stat label="Active users today" value={s.active_today} sub={`Yesterday ${s.active_yesterday} · ${s.active_today_with_push} reachable by push`} />
        <Stat
          label="Active, excl. new"
          value={s.active_excl_new[exclDays]}
          sub={exclDays === "1" ? "Excludes users who signed up today" : `Excludes users who signed up in the last ${exclDays} days`}
        >
          <select
            value={exclDays}
            onChange={(e) => setExclDays(e.target.value as "1" | "2" | "3")}
            aria-label="Exclude new users who signed up within"
            className="text-[11px] rounded-md border border-slate-200 dark:border-white/10 bg-transparent text-slate-600 dark:text-slate-300 px-1.5 py-0.5"
          >
            <option value="1">Today</option>
            <option value="2">2 days</option>
            <option value="3">3 days</option>
          </select>
        </Stat>
      </div>

      {/* Useful metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Weekly active (7d)" value={s.wau} />
        <Stat label="Monthly active (30d)" value={s.mau} />
        <Stat label="Stickiness (DAU / MAU)" value={`${s.stickiness_pct}%`} sub="Share of monthly users who came today" />
        <Stat
          label="Yesterday's signups back today"
          value={`${s.yesterday_new_returned_today} / ${s.new_yesterday}`}
          sub="Day-1 return"
        />
      </div>

      {/* Line chart */}
      <div className={`${box} h-80 flex flex-col`}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
          Active vs new users — last {data.trend.length} days
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
            Today&apos;s active users <span className="text-slate-400 font-normal">({todayRows.length})</span>
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
                <th className={th}>User</th>
                <th className={th}>Signed up</th>
                <th className={th}>Last seen</th>
                <th className={th}>Active days</th>
                <th className={th}>Push</th>
              </tr>
            </thead>
            <tbody>
              {todayRows.map((u) => (
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
                  <td colSpan={5} className={`${td} text-center text-slate-400 py-6`}>No users yet today.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dormant users */}
      <div className={box}>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Gone quiet <span className="text-slate-400 font-normal">({data.dormant_users.length})</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Used the app on 7+ days but not opened it in the last 7 days. Top {MAX_SEND}, most engaged first. Pick up to {MAX_SEND}.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-2 mb-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Push title"
            className="flex-1 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-transparent px-3 py-2"
          />
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Push message"
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
                    checked={selected.size > 0 && selected.size === Math.min(MAX_SEND, data.dormant_users.length)}
                    onChange={(e) =>
                      setSelected(e.target.checked ? new Set(data.dormant_users.slice(0, MAX_SEND).map((u) => u.id)) : new Set())
                    }
                  />
                </th>
                <th className={th}>User</th>
                <th className={th}>Active days</th>
                <th className={th}>Last active</th>
                <th className={th}>Days away</th>
                <th className={th}>Push</th>
              </tr>
            </thead>
            <tbody>
              {data.dormant_users.map((u) => (
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
                  <td className={`${td} tabular-nums`}>{u.lifetime_active_days}</td>
                  <td className={td}>{u.last_active_date ?? "—"}</td>
                  <td className={`${td} tabular-nums`}>{u.days_inactive}</td>
                  <td className={td}>{u.has_push ? <Bell size={14} className="text-indigo-500" aria-label="Has push" /> : <BellOff size={14} className="text-slate-400" aria-label="No push" />}</td>
                </tr>
              ))}
              {data.dormant_users.length === 0 && (
                <tr>
                  <td colSpan={6} className={`${td} text-center text-slate-400 py-6`}>Nobody has gone quiet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
