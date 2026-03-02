import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { SecurityState } from "@/store/securityStore";
import {
  Building2,
  CheckCircle2,
  Flame,
  Globe,
  Home,
  Info,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";

interface FirewallProps {
  state: SecurityState;
  onToggleDomain: () => void;
  onTogglePrivate: () => void;
  onTogglePublic: () => void;
}

interface NetworkCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  subtitle: string;
  enabled: boolean;
  onToggle: () => void;
}

function NetworkCard({
  icon: Icon,
  title,
  description,
  subtitle,
  enabled,
  onToggle,
}: NetworkCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border p-6 transition-all",
        enabled
          ? "border-xeta-green/25 bg-card"
          : "border-xeta-red/30 bg-xeta-red/5",
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            enabled ? "bg-xeta-green/15" : "bg-xeta-red/15",
          )}
        >
          <Icon
            className={cn(
              "w-6 h-6",
              enabled ? "text-xeta-green" : "text-xeta-red",
            )}
          />
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>

      <div className="mb-1">
        <div className="text-base font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
          enabled
            ? "bg-xeta-green/10 border border-xeta-green/25 text-xeta-green"
            : "bg-xeta-red/10 border border-xeta-red/25 text-xeta-red",
        )}
      >
        {enabled ? (
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 flex-shrink-0" />
        )}
        {enabled ? "Firewall is on" : "Firewall is off — turn it on"}
      </div>
    </motion.div>
  );
}

export default function Firewall({
  state,
  onToggleDomain,
  onTogglePrivate,
  onTogglePublic,
}: FirewallProps) {
  const allEnabled =
    state.firewallDomain && state.firewallPrivate && state.firewallPublic;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Status banner */}
      <div
        className={cn(
          "rounded-xl border p-5 flex items-center gap-4",
          allEnabled
            ? "border-xeta-green/25 bg-xeta-green/5"
            : "border-xeta-red/30 bg-xeta-red/5",
        )}
      >
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
            allEnabled ? "bg-xeta-green/20" : "bg-xeta-red/20",
          )}
        >
          <Flame
            className={cn(
              "w-6 h-6",
              allEnabled ? "text-xeta-green" : "text-xeta-red",
            )}
          />
        </div>
        <div>
          <div className="text-base font-semibold text-foreground">
            {allEnabled
              ? "Windows Firewall is active"
              : "Windows Firewall is partially disabled"}
          </div>
          <div className="text-sm text-muted-foreground">
            {allEnabled
              ? "All network profiles are protected by Xeta Defender Firewall."
              : "Some network profiles are not protected. Enable all firewalls."}
          </div>
        </div>
      </div>

      {/* Network cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NetworkCard
          icon={Building2}
          title="Domain network"
          description="Applies when connected to a domain network, such as a workplace or school environment."
          subtitle="e.g., Corporate / school networks"
          enabled={state.firewallDomain}
          onToggle={onToggleDomain}
        />
        <NetworkCard
          icon={Home}
          title="Private network"
          description="Applies when connected to private networks such as your home or trusted WiFi."
          subtitle="e.g., Home / trusted WiFi"
          enabled={state.firewallPrivate}
          onToggle={onTogglePrivate}
        />
        <NetworkCard
          icon={Globe}
          title="Public network"
          description="Applies when connected to public networks like coffee shops, airports, or hotspots."
          subtitle="e.g., Public WiFi / hotspots"
          enabled={state.firewallPublic}
          onToggle={onTogglePublic}
        />
      </div>

      {/* Info panel */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <div className="text-sm font-semibold text-foreground">
              About Windows Firewall
            </div>
            <p className="text-sm text-muted-foreground">
              The firewall monitors network traffic and blocks unauthorized
              connections to and from your device. Keeping it enabled helps
              prevent hackers and malicious software from accessing your device
              through a network or the internet.
            </p>
            <p className="text-sm text-muted-foreground">
              You can allow specific apps through the firewall by adding them to
              the allowed list in Advanced Firewall Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
