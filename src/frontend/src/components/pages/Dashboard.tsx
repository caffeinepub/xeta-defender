import type { Page } from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import type { SecurityState } from "@/store/securityStore";
import {
  Activity,
  AlertTriangle,
  Archive,
  Bug,
  CheckCircle2,
  Clock,
  Flame,
  HardDrive,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  state: SecurityState;
  onToggleRealtime: () => void;
  onNavigate: (page: Page) => void;
  onRunScan: () => void;
}

function SecurityScore({ state }: { state: SecurityState }) {
  const activeThreats = state.threats.filter(
    (t) => t.status === "Active",
  ).length;
  const completedChecks = state.checklist.filter((c) => c.completed).length;
  const totalChecks = state.checklist.length;

  let score = 100;
  if (!state.realtimeProtection) score -= 30;
  if (!state.firewallDomain || !state.firewallPrivate || !state.firewallPublic)
    score -= 20;
  if (activeThreats > 0) score -= activeThreats * 10;
  score += Math.floor((completedChecks / totalChecks) * 10) - 10;
  score = Math.max(0, Math.min(100, score));

  const color = score >= 80 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171";
  const label = score >= 80 ? "Good" : score >= 50 ? "At Risk" : "Critical";

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative w-32 h-32">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 120 120"
          aria-label="Security score gauge"
          role="img"
        >
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="oklch(0.2 0.02 255)"
            strokeWidth="8"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span
        className={cn("text-sm font-semibold", {
          "text-xeta-green": score >= 80,
          "text-xeta-amber": score >= 50 && score < 80,
          "text-xeta-red": score < 50,
        })}
      >
        {label}
      </span>
    </div>
  );
}

export default function Dashboard({
  state,
  onToggleRealtime,
  onNavigate,
  onRunScan,
}: DashboardProps) {
  const activeThreats = state.threats.filter(
    (t) => t.status === "Active",
  ).length;
  const quarantinedThreats = state.threats.filter(
    (t) => t.status === "Quarantined",
  ).length;

  const statusCards = [
    {
      id: "virus-threat" as Page,
      title: "Virus & Threat Protection",
      icon: Bug,
      enabled: state.realtimeProtection,
      statusText: state.realtimeProtection
        ? "Real-time protection: On"
        : "Real-time protection: Off",
      warning: activeThreats > 0 ? `${activeThreats} active threat(s)` : null,
    },
    {
      id: "firewall" as Page,
      title: "Firewall & Network",
      icon: Flame,
      enabled:
        state.firewallDomain && state.firewallPrivate && state.firewallPublic,
      statusText:
        state.firewallDomain && state.firewallPrivate && state.firewallPublic
          ? "All networks protected"
          : "Some networks unprotected",
      warning: null,
    },
    {
      id: "app-browser" as Page,
      title: "App & Browser Control",
      icon: Shield,
      enabled: state.reputationProtection,
      statusText: state.reputationProtection
        ? "Reputation protection: On"
        : "Reputation protection: Off",
      warning: null,
    },
    {
      id: "device-security" as Page,
      title: "Device Security",
      icon: HardDrive,
      enabled: state.secureBootEnabled,
      statusText: state.secureBootEnabled
        ? "Secure Boot: Enabled"
        : "Secure Boot: Disabled",
      warning: null,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Protection status */}
        <div
          className={cn(
            "lg:col-span-1 rounded-xl border p-6 flex flex-col items-center gap-4",
            state.realtimeProtection
              ? "border-xeta-green/30 bg-xeta-green/5 shadow-glow-green"
              : "border-xeta-red/30 bg-xeta-red/5 shadow-glow-red",
          )}
        >
          <motion.div
            animate={
              state.realtimeProtection ? { scale: [1, 1.05, 1] } : { scale: 1 }
            }
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center",
              state.realtimeProtection ? "bg-xeta-green/20" : "bg-xeta-red/20",
            )}
          >
            {state.realtimeProtection ? (
              <ShieldCheck className="w-10 h-10 text-xeta-green" />
            ) : (
              <ShieldAlert className="w-10 h-10 text-xeta-red" />
            )}
          </motion.div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">
              {state.realtimeProtection
                ? "Your device is protected"
                : "Your device is at risk"}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {state.realtimeProtection
                ? "No action needed"
                : "Enable real-time protection"}
            </div>
          </div>
          <SecurityScore state={state} />
        </div>

        {/* Quick stats + actions */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Stats */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Threat Summary
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-xeta-red" />
                  <span>Active Threats</span>
                </div>
                <span
                  className={cn(
                    "text-sm font-bold",
                    activeThreats > 0 ? "text-xeta-red" : "text-xeta-green",
                  )}
                >
                  {activeThreats}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Archive className="w-4 h-4 text-xeta-amber" />
                  <span>Quarantined</span>
                </div>
                <span className="text-sm font-bold text-xeta-amber">
                  {quarantinedThreats}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-xeta-green" />
                  <span>Resolved</span>
                </div>
                <span className="text-sm font-bold text-xeta-green">
                  {state.threats.filter((t) => t.status === "Resolved").length}
                </span>
              </div>
            </div>
          </div>

          {/* Last scan */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Last Scan
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>
                  {state.lastScanDate
                    ? new Date(state.lastScanDate).toLocaleString()
                    : "Never"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span>{state.lastScanType ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bug className="w-4 h-4 text-muted-foreground" />
                <span>
                  {state.lastScanThreatsFound === 0
                    ? "No threats found"
                    : `${state.lastScanThreatsFound} threat(s) found`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="sm:col-span-2 rounded-xl border border-border bg-card p-4">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Quick Actions
            </div>
            <div className="flex flex-wrap gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRunScan}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 transition-colors text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Run Quick Scan
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate("virus-threat")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-xeta-red/10 border border-xeta-red/30 text-xeta-red hover:bg-xeta-red/20 transition-colors text-sm font-medium"
              >
                <Bug className="w-4 h-4" />
                View Threats
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate("virus-threat")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-xeta-amber/10 border border-xeta-amber/30 text-xeta-amber hover:bg-xeta-amber/20 transition-colors text-sm font-medium"
              >
                <Archive className="w-4 h-4" />
                Open Quarantine
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onToggleRealtime}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                  state.realtimeProtection
                    ? "bg-xeta-green/10 border-xeta-green/30 text-xeta-green hover:bg-xeta-green/20"
                    : "bg-muted border-border text-muted-foreground hover:bg-muted/80",
                )}
              >
                <Shield className="w-4 h-4" />
                {state.realtimeProtection
                  ? "Protection On"
                  : "Enable Protection"}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Status cards */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Security Areas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {statusCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(card.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all cursor-pointer group",
                  card.warning
                    ? "border-xeta-red/30 bg-xeta-red/5"
                    : card.enabled
                      ? "border-xeta-green/20 bg-card hover:border-xeta-green/40"
                      : "border-xeta-amber/30 bg-xeta-amber/5",
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center",
                      card.warning
                        ? "bg-xeta-red/20"
                        : card.enabled
                          ? "bg-xeta-green/15"
                          : "bg-xeta-amber/20",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        card.warning
                          ? "text-xeta-red"
                          : card.enabled
                            ? "text-xeta-green"
                            : "text-xeta-amber",
                      )}
                    />
                  </div>
                  {card.warning ? (
                    <AlertTriangle className="w-4 h-4 text-xeta-red" />
                  ) : card.enabled ? (
                    <CheckCircle2 className="w-4 h-4 text-xeta-green" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-xeta-amber" />
                  )}
                </div>
                <div className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {card.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {card.warning ?? card.statusText}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
