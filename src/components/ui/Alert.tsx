import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { clsx } from "clsx";

export interface AlertProps {
  type?: "success" | "warning" | "error" | "info";
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function Alert({
  type = "info",
  title,
  children,
  className = "",
  action,
}: AlertProps) {
  const typeConfig = {
    success: {
      container:
        "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
    },
    warning: {
      container:
        "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300",
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
    },
    error: {
      container:
        "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300",
      icon: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
    },
    info: {
      container:
        "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-300",
      icon: <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />,
    },
  };

  const current = typeConfig[type];

  return (
    <div
      className={clsx(
        "p-4 rounded-xl border flex items-start justify-between gap-3 text-xs leading-relaxed transition-colors",
        current.container,
        className
      )}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        {current.icon}
        <div className="min-w-0">
          {title && <p className="font-bold text-xs mb-0.5">{title}</p>}
          <div>{children}</div>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
