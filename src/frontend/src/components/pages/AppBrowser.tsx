import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { SecurityState } from "@/store/securityStore";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Globe,
  Settings,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

interface AppBrowserProps {
  state: SecurityState;
  onToggleReputation: () => void;
  onToggleExploit: () => void;
}

const EXPLOIT_SETTINGS = [
  {
    id: "cfg",
    name: "Control Flow Guard (CFG)",
    description:
      "Helps prevent attackers from taking control of a program through memory corruption vulnerabilities.",
    status: "On (default)",
    enabled: true,
  },
  {
    id: "dep",
    name: "Data Execution Prevention (DEP)",
    description:
      "Prevents code from running in memory regions marked as non-executable.",
    status: "On (default)",
    enabled: true,
  },
  {
    id: "aslr",
    name: "Force Randomization for Images (ASLR)",
    description: "Forces DLLs that don't opt in to be randomly relocated.",
    status: "Off (default)",
    enabled: false,
  },
  {
    id: "heap",
    name: "Heap Type Enforcement",
    description:
      "Causes Win32 heap exceptions to be thrown when a heap type switch is detected.",
    status: "On (default)",
    enabled: true,
  },
  {
    id: "stack",
    name: "Stack Protection",
    description:
      "Validates the integrity of the stack and detects stack corruption by a buffer overflow.",
    status: "On (default)",
    enabled: true,
  },
];

export default function AppBrowser({
  state,
  onToggleReputation,
  onToggleExploit,
}: AppBrowserProps) {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Reputation-based protection */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-base font-semibold text-foreground">
              Reputation-based protection
            </div>
            <div className="text-xs text-muted-foreground">
              SmartScreen and phishing protection
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-5">
          Uses Microsoft Defender SmartScreen to protect your device from
          malicious apps, files, and websites by checking reputation data.
        </p>

        <div className="space-y-3">
          {[
            {
              label: "Check apps and files",
              description:
                "Warns about unrecognized apps and files from the web",
              enabled: state.reputationProtection,
              onToggle: onToggleReputation,
            },
            {
              label: "SmartScreen for Microsoft Edge",
              description:
                "Helps protect against malicious sites and downloads",
              enabled: state.reputationProtection,
              onToggle: onToggleReputation,
            },
            {
              label: "Phishing protection",
              description: "Warns when you enter passwords on phishing sites",
              enabled: state.reputationProtection,
              onToggle: onToggleReputation,
            },
            {
              label: "Potentially unwanted app blocking",
              description:
                "Blocks downloads that might cause unexpected behavior",
              enabled: state.reputationProtection,
              onToggle: onToggleReputation,
            },
          ].map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/40 border border-border/50"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  {item.enabled ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-xeta-green flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-xeta-amber flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 ml-5">
                  {item.description}
                </p>
              </div>
              <Switch checked={item.enabled} onCheckedChange={item.onToggle} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Exploit protection */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                state.exploitProtection ? "bg-xeta-green/15" : "bg-muted",
              )}
            >
              <Shield
                className={cn(
                  "w-5 h-5",
                  state.exploitProtection
                    ? "text-xeta-green"
                    : "text-muted-foreground",
                )}
              />
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">
                Exploit protection
              </div>
              <div className="text-xs text-muted-foreground">
                Built-in protection against attacks
              </div>
            </div>
          </div>
          <Switch
            checked={state.exploitProtection}
            onCheckedChange={onToggleExploit}
          />
        </div>

        <p className="text-sm text-muted-foreground mb-5">
          Automatically applies many exploit mitigation techniques to processes
          and apps. These work with anti-virus software to prevent attackers
          from using exploits.
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              System Settings
            </span>
          </div>
          {EXPLOIT_SETTINGS.map((setting, i) => (
            <motion.div
              key={setting.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors cursor-default group"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <Zap
                    className={cn(
                      "w-3.5 h-3.5 flex-shrink-0",
                      setting.enabled
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {setting.name}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 ml-5">
                  {setting.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-medium",
                    setting.enabled
                      ? "text-xeta-green"
                      : "text-muted-foreground",
                  )}
                >
                  {setting.status}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
