import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Bell,
  CheckCheck,
  Menu,
  Moon,
  Settings,
  Shield,
  Sun,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "./Sidebar";

interface HeaderProps {
  currentPage: Page;
  protectionActive: boolean;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Security at a glance",
  "virus-threat": "Virus & Threat Protection",
  firewall: "Firewall & Network Protection",
  "app-browser": "App & Browser Control",
  "device-security": "Device Security",
  checklist: "Security Checklist",
  "password-checker": "Password Strength Checker",
};

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    message: "Quick Scan completed — No threats found",
    time: "2 min ago",
    read: false,
  },
  {
    id: "n2",
    message: "Real-time protection is active",
    time: "15 min ago",
    read: false,
  },
  {
    id: "n3",
    message: "Definitions updated to 1.421.2760.0",
    time: "1 hr ago",
    read: false,
  },
];

interface AppSettings {
  notificationSounds: boolean;
  autoScanOnStartup: boolean;
  darkMode: boolean;
  updateInterval: string;
}

export default function Header({
  currentPage,
  protectionActive,
  mobileMenuOpen,
  onToggleMobileMenu,
  darkMode,
  onToggleDarkMode,
}: HeaderProps) {
  // ── Notifications state ───────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<Notification[]>(
    INITIAL_NOTIFICATIONS,
  );
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // ── Settings state ────────────────────────────────────────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    notificationSounds: true,
    autoScanOnStartup: false,
    darkMode: darkMode,
    updateInterval: "daily",
  });

  const saveSettings = () => {
    if (settings.darkMode !== darkMode) {
      onToggleDarkMode();
    }
    setSettingsOpen(false);
    toast.success("Settings saved");
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-card/60 backdrop-blur-sm flex-shrink-0">
      {/* Mobile menu button + page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="md:hidden p-1.5 rounded-md hover:bg-muted transition-colors"
          onClick={onToggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2">
          <Shield
            className={cn(
              "w-5 h-5",
              protectionActive ? "text-xeta-green" : "text-xeta-red",
            )}
          />
          <span className="font-semibold text-sm">Xeta Defender</span>
        </div>
        <div className="hidden md:block">
          <h1 className="text-base font-semibold text-foreground">
            {PAGE_TITLES[currentPage]}
          </h1>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
            protectionActive
              ? "bg-xeta-green/10 text-xeta-green border-xeta-green/30"
              : "bg-xeta-red/10 text-xeta-red border-xeta-red/30",
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              protectionActive
                ? "bg-xeta-green animate-pulse"
                : "bg-xeta-red animate-pulse",
            )}
          />
          {protectionActive ? "Protected" : "At Risk"}
        </div>

        {/* Bell / Notifications */}
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-xeta-red flex items-center justify-center" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-80 p-0 bg-card border-border shadow-xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-xeta-red text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>
            <div className="divide-y divide-border">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    "px-4 py-3 flex items-start gap-3 transition-colors",
                    !notif.read ? "bg-primary/5" : "hover:bg-muted/30",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 w-2 h-2 rounded-full flex-shrink-0",
                      !notif.read ? "bg-primary" : "bg-transparent",
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {notif.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {unreadCount === 0 && (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                All caught up!
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Settings */}
        <button
          type="button"
          className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Settings className="w-4 h-4 text-muted-foreground" />
              Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Notification sounds */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Notification sounds
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Play a sound when alerts are triggered
                </p>
              </div>
              <Switch
                checked={settings.notificationSounds}
                onCheckedChange={(v) =>
                  setSettings((s) => ({ ...s, notificationSounds: v }))
                }
              />
            </div>

            <div className="border-t border-border" />

            {/* Auto-scan on startup */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Auto-scan on startup
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Run a quick scan when the app launches
                </p>
              </div>
              <Switch
                checked={settings.autoScanOnStartup}
                onCheckedChange={(v) =>
                  setSettings((s) => ({ ...s, autoScanOnStartup: v }))
                }
              />
            </div>

            <div className="border-t border-border" />

            {/* Dark / Light theme toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.darkMode ? (
                  <Moon className="w-4 h-4 text-primary" />
                ) : (
                  <Sun className="w-4 h-4 text-xeta-amber" />
                )}
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    {settings.darkMode ? "Dark mode" : "Light mode"}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Toggle between dark and light theme
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(v) =>
                  setSettings((s) => ({ ...s, darkMode: v }))
                }
              />
            </div>

            <div className="border-t border-border" />

            {/* Definition update interval */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-foreground">
                  Definition update interval
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  How often to check for definition updates
                </p>
              </div>
              <Select
                value={settings.updateInterval}
                onValueChange={(v) =>
                  setSettings((s) => ({ ...s, updateInterval: v }))
                }
              >
                <SelectTrigger className="w-28 h-8 text-xs bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="daily" className="text-xs">
                    Daily
                  </SelectItem>
                  <SelectItem value="weekly" className="text-xs">
                    Weekly
                  </SelectItem>
                  <SelectItem value="manual" className="text-xs">
                    Manual
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={saveSettings}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
