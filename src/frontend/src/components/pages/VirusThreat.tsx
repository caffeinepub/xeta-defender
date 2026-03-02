import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type {
  SecurityState,
  Severity,
  Threat,
  ThreatStatus,
} from "@/store/securityStore";
import {
  AlertTriangle,
  Archive,
  Bug,
  CheckCircle2,
  Clock,
  FolderSearch,
  HardDrive,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface VirusThreatProps {
  state: SecurityState;
  onToggleRealtime: () => void;
  onToggleCloud: () => void;
  onRunScan: (type: "quick" | "full" | "custom") => void;
  isScanning: boolean;
  scanProgress: number;
  scanType: string;
  onQuarantine: (id: string) => void;
  onRemove: (id: string) => void;
  onRestore: (id: string) => void;
}

const SEVERITY_COLORS: Record<Severity, string> = {
  Low: "bg-xeta-green/15 text-xeta-green border-xeta-green/30",
  Medium: "bg-xeta-amber/15 text-xeta-amber border-xeta-amber/30",
  High: "bg-orange-500/15 text-orange-400 border-orange-400/30",
  Critical: "bg-xeta-red/15 text-xeta-red border-xeta-red/30",
};

const STATUS_COLORS: Record<ThreatStatus, string> = {
  Active: "bg-xeta-red/15 text-xeta-red border-xeta-red/30",
  Quarantined: "bg-xeta-amber/15 text-xeta-amber border-xeta-amber/30",
  Resolved: "bg-xeta-green/15 text-xeta-green border-xeta-green/30",
};

function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border",
        SEVERITY_COLORS[severity],
      )}
    >
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: ThreatStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border",
        STATUS_COLORS[status],
      )}
    >
      {status}
    </span>
  );
}

function ThreatRow({
  threat,
  onQuarantine,
  onRemove,
  onRestore,
}: {
  threat: Threat;
  onQuarantine: (id: string) => void;
  onRemove: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
    >
      <td className="py-3 px-4">
        <div className="text-sm font-medium text-foreground font-mono">
          {threat.name}
        </div>
        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
          {threat.path}
        </div>
      </td>
      <td className="py-3 px-4">
        <SeverityBadge severity={threat.severity} />
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={threat.status} />
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
        {threat.date}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {threat.status === "Active" && (
            <button
              type="button"
              onClick={() => onQuarantine(threat.id)}
              className="p-1.5 rounded hover:bg-xeta-amber/20 text-xeta-amber transition-colors text-xs"
              title="Quarantine"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          )}
          {threat.status === "Quarantined" && (
            <button
              type="button"
              onClick={() => onRestore(threat.id)}
              className="p-1.5 rounded hover:bg-xeta-green/20 text-xeta-green transition-colors"
              title="Restore"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(threat.id)}
            className="p-1.5 rounded hover:bg-xeta-red/20 text-xeta-red transition-colors"
            title="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

export default function VirusThreat({
  state,
  onToggleRealtime,
  onToggleCloud,
  onRunScan,
  isScanning,
  scanProgress,
  scanType,
  onQuarantine,
  onRemove,
  onRestore,
}: VirusThreatProps) {
  const activeThreats = state.threats.filter((t) => t.status === "Active");
  const quarantinedThreats = state.threats.filter(
    (t) => t.status === "Quarantined",
  );

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Protection settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Real-time protection */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  state.realtimeProtection
                    ? "bg-xeta-green/15"
                    : "bg-xeta-red/15",
                )}
              >
                <ShieldCheck
                  className={cn(
                    "w-5 h-5",
                    state.realtimeProtection
                      ? "text-xeta-green"
                      : "text-xeta-red",
                  )}
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Real-time protection
                </div>
                <div className="text-xs text-muted-foreground">
                  Detect and stop malware in real time
                </div>
              </div>
            </div>
            <Switch
              checked={state.realtimeProtection}
              onCheckedChange={onToggleRealtime}
            />
          </div>
          {!state.realtimeProtection && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-xeta-red/10 border border-xeta-red/30">
              <AlertTriangle className="w-4 h-4 text-xeta-red flex-shrink-0" />
              <span className="text-xs text-xeta-red">
                Your device is vulnerable. Enable real-time protection.
              </span>
            </div>
          )}
        </div>

        {/* Cloud protection */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  state.cloudProtection ? "bg-primary/15" : "bg-muted",
                )}
              >
                <Bug
                  className={cn(
                    "w-5 h-5",
                    state.cloudProtection
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Cloud-delivered protection
                </div>
                <div className="text-xs text-muted-foreground">
                  Fastest protection with cloud intelligence
                </div>
              </div>
            </div>
            <Switch
              checked={state.cloudProtection}
              onCheckedChange={onToggleCloud}
            />
          </div>
        </div>
      </div>

      {/* Scan controls */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Scan Options
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onRunScan("quick")}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
          >
            <Search className="w-4 h-4" />
            Quick Scan
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onRunScan("full")}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
          >
            <HardDrive className="w-4 h-4" />
            Full Scan
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onRunScan("custom")}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
          >
            <FolderSearch className="w-4 h-4" />
            Custom Scan
          </motion.button>
        </div>

        {/* Scan progress */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>{scanType} in progress...</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {scanProgress}%
                </span>
              </div>
              <Progress value={scanProgress} className="h-2" />
              <div className="text-xs text-muted-foreground font-mono">
                Scanning: C:\Windows\System32\drivers\
                {Math.floor(scanProgress / 10) * 1234}.sys
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isScanning && state.lastScanDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            Last scan: {new Date(state.lastScanDate).toLocaleString()} —{" "}
            {state.lastScanThreatsFound === 0
              ? "No threats found"
              : `${state.lastScanThreatsFound} threat(s) found`}
          </div>
        )}
      </div>

      {/* Active Threats */}
      {activeThreats.length > 0 && (
        <div className="rounded-xl border border-xeta-red/30 bg-xeta-red/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-xeta-red" />
            <span className="text-sm font-semibold text-xeta-red">
              {activeThreats.length} Active Threat
              {activeThreats.length > 1 ? "s" : ""} Detected
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-xeta-red/20">
                  <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Threat
                  </th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Severity
                  </th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {activeThreats.map((t) => (
                    <ThreatRow
                      key={t.id}
                      threat={t}
                      onQuarantine={onQuarantine}
                      onRemove={onRemove}
                      onRestore={onRestore}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quarantine */}
      {quarantinedThreats.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Archive className="w-4 h-4 text-xeta-amber" />
            <span className="text-sm font-semibold text-foreground">
              Quarantine ({quarantinedThreats.length})
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Threat
                  </th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Severity
                  </th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {quarantinedThreats.map((t) => (
                    <ThreatRow
                      key={t.id}
                      threat={t}
                      onQuarantine={onQuarantine}
                      onRemove={onRemove}
                      onRestore={onRestore}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Threat history */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-xeta-green" />
            <span className="text-sm font-semibold text-foreground">
              Threat History
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {state.threats.length} total
          </Badge>
        </div>
        {state.threats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No threats in history
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Threat
                  </th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Severity
                  </th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {state.threats.map((t) => (
                    <ThreatRow
                      key={t.id}
                      threat={t}
                      onQuarantine={onQuarantine}
                      onRemove={onRemove}
                      onRestore={onRestore}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
