import {
  Home,
  LayoutDashboard,
  Users,
  Settings,
  LineChart,
  MessageSquare,
  Database,
  Gift,
  Bell,
  MessageSquarePlus,
  Target,
  CandlestickChart,
  Activity,
  Sparkles,
  CreditCard,
  Mail,
  Timer,
  UserCheck,
} from "lucide-react";

export interface NavGroup {
  title: string;
  items: Array<{
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }>;
}

// Shared by the sidebar and the home page quick-access grid.
export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/", label: "Home", icon: Home },
      { href: "/overview", label: "Dashboard", icon: LayoutDashboard },
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
      { href: "/campaigns", label: "Email Campaigns", icon: Mail },
      { href: "/buy-signals", label: "Recommended Signals", icon: CandlestickChart },
      { href: "/analytics", label: "Platform Analytics", icon: LineChart },
      { href: "/daily-users", label: "Daily Users", icon: UserCheck },
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
      { href: "/cron-runs", label: "Cron Runs", icon: Timer },
      { href: "/settings", label: "Admin & Security", icon: Settings },
    ],
  },
];
