import React from "react";
import { clsx } from "clsx";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";

export interface DataTableProps {
  children: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable({
  children,
  loading = false,
  empty = false,
  emptyMessage = "No data found",
  className = "",
}: DataTableProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 space-y-4 shadow-xs">
        <Skeleton className="h-6 w-1/3" />
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <EmptyState
        title={emptyMessage}
        description="Try adjusting your search criteria or active filters."
      />
    );
  }

  return (
    <div
      className={clsx(
        "bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xs overflow-hidden transition-colors",
        className
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Table({
  children,
  className = "",
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={clsx("w-full text-left text-xs sm:text-sm text-slate-700 dark:text-slate-300", className)}
      {...props}
    >
      {children}
    </table>
  );
}

export function TableHead({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={clsx(
        "bg-slate-50/80 dark:bg-[#070a13] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08] sticky top-0 z-10",
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={clsx("divide-y divide-slate-100 dark:divide-white/[0.04]", className)}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={clsx(
        "hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHeaderCell({
  children,
  sortable = false,
  direction,
  onSort,
  className = "",
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & {
  sortable?: boolean;
  direction?: "asc" | "desc" | null;
  onSort?: () => void;
}) {
  return (
    <th
      className={clsx(
        "px-4 sm:px-5 py-3.5 font-bold select-none",
        sortable && "cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors",
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-1.5">
        <span>{children}</span>
        {sortable && (
          <span className="shrink-0 text-slate-400">
            {direction === "asc" ? (
              <ArrowUp size={13} className="text-indigo-600 dark:text-indigo-400" />
            ) : direction === "desc" ? (
              <ArrowDown size={13} className="text-indigo-600 dark:text-indigo-400" />
            ) : (
              <ArrowUpDown size={13} className="opacity-40" />
            )}
          </span>
        )}
      </div>
    </th>
  );
}

export function TableCell({
  children,
  className = "",
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={clsx("px-4 sm:px-5 py-3.5", className)} {...props}>
      {children}
    </td>
  );
}
