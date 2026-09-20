import React from "react";
import { FolderOpen } from "lucide-react";
import { clsx } from "clsx";

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return <FolderOpen className="w-5 h-5" />;
    if (React.isValidElement(icon)) return icon;
    const IconComponent = icon as React.ElementType;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-slate-900/20",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center mb-3">
        {renderIcon()}
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
