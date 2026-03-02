import { cn } from "@/lib/utils";
import {
  Bug,
  CheckSquare,
  ChevronRight,
  Flame,
  Globe,
  HardDrive,
  Lock,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";

export type Page =
  | "dashboard"
  | "virus-threat"
  | "firewall"
  | "app-browser"
  | "device-security"
  | "checklist"
  | "password-checker";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Home", icon: Shield },
  { id: "virus-threat", label: "Virus & Threat Protection", icon: Bug },
  { id: "firewall", label: "Firewall & Network", icon: Flame },
  { id: "app-browser", label: "App & Browser Control", icon: Globe },
  { id: "device-security", label: "Device Security", icon: HardDrive },
  { id: "checklist", label: "Security Checklist", icon: CheckSquare },
  { id: "password-checker", label: "Password Checker", icon: Lock },
];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  threatCount: number;
  protectionActive: boolean;
}

export default function Sidebar({
  currentPage,
  onNavigate,
  threatCount,
  protectionActive,
}: SidebarProps) {
  return (
    <aside
      className="hidden md:flex flex-col w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border"
      style={{ minHeight: "100vh" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="relative">
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              protectionActive
                ? "bg-xeta-green/20 shadow-glow-green"
                : "bg-xeta-red/20 shadow-glow-red",
            )}
          >
            <Shield
              className={cn(
                "w-5 h-5",
                protectionActive ? "text-xeta-green" : "text-xeta-red",
              )}
            />
          </div>
          {protectionActive && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-xeta-green animate-ping" />
          )}
        </div>
        <div>
          <div className="font-semibold text-sm text-foreground tracking-tight">
            Xeta Defender
          </div>
          <div
            className={cn(
              "text-xs font-medium",
              protectionActive ? "text-xeta-green" : "text-xeta-red",
            )}
          >
            {protectionActive ? "Protected" : "At Risk"}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors relative group",
                active
                  ? "bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="active-nav"
                  className="absolute left-0 inset-y-1 w-0.5 rounded-full bg-primary"
                />
              )}
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  active
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.id === "virus-threat" && threatCount > 0 && (
                <span className="flex-shrink-0 bg-xeta-red/80 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {threatCount}
                </span>
              )}
              {active && (
                <ChevronRight className="w-3.5 h-3.5 text-primary opacity-60" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom status */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground mb-1">Definitions</div>
        <div className="text-xs text-foreground font-medium">
          Version 1.421.2760.0
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          Updated today at 06:00 AM
        </div>
      </div>
    </aside>
  );
}
