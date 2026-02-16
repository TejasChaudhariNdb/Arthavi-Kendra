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
} from "lucide-react";
import { clsx } from "clsx";

const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/users", label: "Users", icon: Users },
    { href: "/referrals", label: "Referrals", icon: Gift },
    { href: "/master-data", label: "Master Data", icon: Database },
    { href: "/chats", label: "AI Chats", icon: MessageSquare },
    { href: "/analytics", label: "Analytics", icon: LineChart },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="h-full w-64 bg-gray-900 text-white flex flex-col border-r border-gray-800">
      <div className="p-6 text-2xl font-bold bg-gray-950 text-white flex justify-between items-center">
        <span>Arthavi Admin</span>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={clsx(
                "flex items-center gap-3 p-3 rounded-lg transition-all font-medium",
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              )}>
              <link.icon size={20} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
        v1.0.0 • Arthavi
      </div>
    </div>
  );
};

export default Sidebar;
