import { cn } from "@/lib/utils";
import {
  Bug,
  CheckSquare,
  Flame,
  Globe,
  HardDrive,
  Lock,
  Shield,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Page } from "./Sidebar";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Home", icon: Shield },
  { id: "virus-threat", label: "Virus", icon: Bug },
  { id: "firewall", label: "Firewall", icon: Flame },
  { id: "app-browser", label: "Apps", icon: Globe },
  { id: "device-security", label: "Device", icon: HardDrive },
  { id: "checklist", label: "Checklist", icon: CheckSquare },
  { id: "password-checker", label: "Password", icon: Lock },
];

interface MobileNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
  threatCount: number;
  protectionActive: boolean;
}

export default function MobileNav({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
  threatCount,
  protectionActive,
}: MobileNavProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={onClose}
          />
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 w-72 z-50 bg-sidebar border-r border-sidebar-border flex flex-col md:hidden"
          >
            {/* Brand */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center",
                  protectionActive ? "bg-xeta-green/20" : "bg-xeta-red/20",
                )}
              >
                <Shield
                  className={cn(
                    "w-5 h-5",
                    protectionActive ? "text-xeta-green" : "text-xeta-red",
                  )}
                />
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground">
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

            {/* Nav items */}
            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = currentPage === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors relative",
                      active
                        ? "bg-primary/15 text-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 inset-y-1 w-0.5 rounded-full bg-primary" />
                    )}
                    <Icon
                      className={cn(
                        "w-4 h-4 flex-shrink-0",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.id === "virus-threat" && threatCount > 0 && (
                      <span className="bg-xeta-red/80 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {threatCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
