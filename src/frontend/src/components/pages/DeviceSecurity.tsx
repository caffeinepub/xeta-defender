import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { SecurityState } from "@/store/securityStore";
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  HardDrive,
  Info,
  Lock,
  Server,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";

interface DeviceSecurityProps {
  state: SecurityState;
  onToggleCoreIsolation: () => void;
  onToggleSecureBoot: () => void;
}

function InfoCard({
  icon: Icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {title}
        </span>
      </div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
      {subtitle && (
        <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
      )}
    </div>
  );
}

export default function DeviceSecurity({
  state,
  onToggleCoreIsolation,
  onToggleSecureBoot,
}: DeviceSecurityProps) {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Core isolation */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              state.coreIsolation ? "bg-xeta-green/15" : "bg-muted",
            )}
          >
            <Lock
              className={cn(
                "w-5 h-5",
                state.coreIsolation
                  ? "text-xeta-green"
                  : "text-muted-foreground",
              )}
            />
          </div>
          <div>
            <div className="text-base font-semibold text-foreground">
              Core isolation
            </div>
            <div className="text-xs text-muted-foreground">
              Virtualization-based security features
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-5">
          Core isolation provides added protection against malware and other
          attacks by isolating computer processes from your operating system and
          device.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between p-4 rounded-lg bg-muted/40 border border-border/50"
        >
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2">
              {state.coreIsolation ? (
                <CheckCircle2 className="w-4 h-4 text-xeta-green" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-xeta-amber" />
              )}
              <span className="text-sm font-semibold text-foreground">
                Memory integrity
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 ml-6">
              Prevents attacks from inserting malicious code into high-security
              processes.
              {!state.coreIsolation &&
                " Enabling this may require a device restart."}
            </p>
          </div>
          <Switch
            checked={state.coreIsolation}
            onCheckedChange={onToggleCoreIsolation}
          />
        </motion.div>

        {!state.coreIsolation && (
          <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-xeta-amber/10 border border-xeta-amber/25">
            <Info className="w-4 h-4 text-xeta-amber flex-shrink-0 mt-0.5" />
            <span className="text-xs text-xeta-amber">
              Memory integrity is off. Some drivers may be incompatible. Check
              driver updates before enabling.
            </span>
          </div>
        )}
      </div>

      {/* Security processor (TPM) */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-base font-semibold text-foreground">
              Security processor
            </div>
            <div className="text-xs text-muted-foreground">
              Trusted Platform Module (TPM)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-xeta-green/10 border border-xeta-green/25">
          <CheckCircle2 className="w-4 h-4 text-xeta-green flex-shrink-0" />
          <span className="text-sm text-xeta-green font-medium">
            Security processor is running normally
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            icon={Cpu}
            title="Manufacturer"
            value="Intel Corporation"
            subtitle="Intel PTT (fTPM)"
          />
          <InfoCard
            icon={Server}
            title="Specification version"
            value="TPM 2.0"
            subtitle="Compliant with FIPS 140-2"
          />
          <InfoCard
            icon={HardDrive}
            title="Firmware version"
            value="7.63.3353.0"
            subtitle="Up to date"
          />
          <InfoCard
            icon={Shield}
            title="PCR banks"
            value="SHA-256, SHA-384"
            subtitle="Active algorithms"
          />
        </div>
      </div>

      {/* Secure Boot */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                state.secureBootEnabled ? "bg-xeta-green/15" : "bg-xeta-red/15",
              )}
            >
              <Shield
                className={cn(
                  "w-5 h-5",
                  state.secureBootEnabled ? "text-xeta-green" : "text-xeta-red",
                )}
              />
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">
                Secure Boot
              </div>
              <div className="text-xs text-muted-foreground">
                UEFI firmware security feature
              </div>
            </div>
          </div>
          <Switch
            checked={state.secureBootEnabled}
            onCheckedChange={onToggleSecureBoot}
          />
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          Secure Boot prevents unauthorized operating systems and software from
          loading during the startup process. It checks signatures during boot
          to ensure that only trusted software is executed.
        </p>

        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border",
            state.secureBootEnabled
              ? "bg-xeta-green/10 border-xeta-green/25 text-xeta-green"
              : "bg-xeta-red/10 border-xeta-red/25 text-xeta-red",
          )}
        >
          {state.secureBootEnabled ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          )}
          {state.secureBootEnabled
            ? "Secure Boot is on"
            : "Secure Boot is off — your device may be vulnerable"}
        </div>
      </div>
    </div>
  );
}
