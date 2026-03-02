import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import type { Page } from "@/components/Sidebar";
import AppBrowser from "@/components/pages/AppBrowser";
import Dashboard from "@/components/pages/Dashboard";
import DeviceSecurity from "@/components/pages/DeviceSecurity";
import Firewall from "@/components/pages/Firewall";
import PasswordChecker from "@/components/pages/PasswordChecker";
import SecurityChecklist from "@/components/pages/SecurityChecklist";
import VirusThreat from "@/components/pages/VirusThreat";
import { Toaster } from "@/components/ui/sonner";
import {
  type SecurityState,
  generateThreat,
  loadState,
  saveState,
} from "@/store/securityStore";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function Footer() {
  return (
    <footer className="flex-shrink-0 border-t border-border bg-card/40 px-4 py-2.5 flex items-center justify-between">
      <div className="text-xs text-muted-foreground">
        Xeta Defender v1.421.2760.0 &mdash; Definitions: 1.421.2760.0
      </div>
    </footer>
  );
}

export default function App() {
  const [state, setState] = useState<SecurityState>(() => loadState());
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanType, setScanType] = useState("Quick Scan");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("xeta-theme") !== "light";
  });
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Apply theme class to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.remove("light");
    } else {
      html.classList.add("light");
    }
    localStorage.setItem("xeta-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateState = useCallback(
    (updater: (prev: SecurityState) => SecurityState) => {
      setState(updater);
    },
    [],
  );

  // ── Toggles ────────────────────────────────────────────────────────────────
  const toggleRealtime = useCallback(() => {
    updateState((prev) => {
      const next = { ...prev, realtimeProtection: !prev.realtimeProtection };
      if (!next.realtimeProtection) {
        toast.warning("Real-time protection disabled. Your device is at risk.");
      } else {
        toast.success("Real-time protection enabled.");
      }
      return next;
    });
  }, [updateState]);

  const toggleCloud = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      cloudProtection: !prev.cloudProtection,
    }));
  }, [updateState]);

  const toggleFirewallDomain = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      firewallDomain: !prev.firewallDomain,
    }));
  }, [updateState]);

  const toggleFirewallPrivate = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      firewallPrivate: !prev.firewallPrivate,
    }));
  }, [updateState]);

  const toggleFirewallPublic = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      firewallPublic: !prev.firewallPublic,
    }));
  }, [updateState]);

  const toggleReputation = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      reputationProtection: !prev.reputationProtection,
    }));
  }, [updateState]);

  const toggleExploit = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      exploitProtection: !prev.exploitProtection,
    }));
  }, [updateState]);

  const toggleCoreIsolation = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      coreIsolation: !prev.coreIsolation,
    }));
  }, [updateState]);

  const toggleSecureBoot = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      secureBootEnabled: !prev.secureBootEnabled,
    }));
  }, [updateState]);

  const toggleChecklistItem = useCallback(
    (id: string) => {
      updateState((prev) => ({
        ...prev,
        checklist: prev.checklist.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item,
        ),
      }));
    },
    [updateState],
  );

  // ── Scan logic ─────────────────────────────────────────────────────────────
  const runScan = useCallback(
    (type: "quick" | "full" | "custom") => {
      if (isScanning) return;
      const labels = {
        quick: "Quick Scan",
        full: "Full Scan",
        custom: "Custom Scan",
      };
      const durations = { quick: 4000, full: 8000, custom: 5000 };
      const label = labels[type];
      const duration = durations[type];
      setScanType(label);
      setScanProgress(0);
      setIsScanning(true);
      setCurrentPage("virus-threat");

      const startTime = Date.now();
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

      scanIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, Math.round((elapsed / duration) * 100));
        setScanProgress(progress);

        if (progress >= 100) {
          if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
          setIsScanning(false);

          // Generate random threats (0-3)
          const threatCount = Math.floor(Math.random() * 4); // 0, 1, 2, or 3
          const now = new Date().toISOString();

          updateState((prev) => {
            const newThreats = Array.from({ length: threatCount }, (_, i) =>
              generateThreat(`scan-${Date.now()}-${i}`),
            );
            return {
              ...prev,
              threats: [...newThreats, ...prev.threats],
              lastScanDate: now,
              lastScanType: label,
              lastScanThreatsFound: threatCount,
            };
          });

          if (threatCount > 0) {
            toast.error(
              `${label} complete — ${threatCount} threat${threatCount > 1 ? "s" : ""} detected!`,
              { duration: 5000 },
            );
          } else {
            toast.success(`${label} complete — No threats found.`, {
              duration: 4000,
            });
          }
        }
      }, 100);
    },
    [isScanning, updateState],
  );

  // Quick scan shortcut from dashboard
  const handleDashboardScan = useCallback(() => {
    runScan("quick");
  }, [runScan]);

  // ── Threat actions ─────────────────────────────────────────────────────────
  const quarantineThreat = useCallback(
    (id: string) => {
      updateState((prev) => ({
        ...prev,
        threats: prev.threats.map((t) =>
          t.id === id ? { ...t, status: "Quarantined" as const } : t,
        ),
      }));
      toast.success("Threat quarantined successfully.");
    },
    [updateState],
  );

  const removeThreat = useCallback(
    (id: string) => {
      updateState((prev) => ({
        ...prev,
        threats: prev.threats.filter((t) => t.id !== id),
      }));
      toast.success("Threat removed permanently.");
    },
    [updateState],
  );

  const restoreThreat = useCallback(
    (id: string) => {
      updateState((prev) => ({
        ...prev,
        threats: prev.threats.map((t) =>
          t.id === id ? { ...t, status: "Resolved" as const } : t,
        ),
      }));
      toast.info("Item restored from quarantine.");
    },
    [updateState],
  );

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);

  const activeThreats = state.threats.filter(
    (t) => t.status === "Active",
  ).length;
  const isProtected =
    state.realtimeProtection &&
    state.firewallDomain &&
    state.firewallPrivate &&
    state.firewallPublic &&
    activeThreats === 0;

  // ── Page renderer ──────────────────────────────────────────────────────────
  function renderPage() {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            state={state}
            onToggleRealtime={toggleRealtime}
            onNavigate={setCurrentPage}
            onRunScan={handleDashboardScan}
          />
        );
      case "virus-threat":
        return (
          <VirusThreat
            state={state}
            onToggleRealtime={toggleRealtime}
            onToggleCloud={toggleCloud}
            onRunScan={runScan}
            isScanning={isScanning}
            scanProgress={scanProgress}
            scanType={scanType}
            onQuarantine={quarantineThreat}
            onRemove={removeThreat}
            onRestore={restoreThreat}
          />
        );
      case "firewall":
        return (
          <Firewall
            state={state}
            onToggleDomain={toggleFirewallDomain}
            onTogglePrivate={toggleFirewallPrivate}
            onTogglePublic={toggleFirewallPublic}
          />
        );
      case "app-browser":
        return (
          <AppBrowser
            state={state}
            onToggleReputation={toggleReputation}
            onToggleExploit={toggleExploit}
          />
        );
      case "device-security":
        return (
          <DeviceSecurity
            state={state}
            onToggleCoreIsolation={toggleCoreIsolation}
            onToggleSecureBoot={toggleSecureBoot}
          />
        );
      case "checklist":
        return (
          <SecurityChecklist
            checklist={state.checklist}
            onToggleItem={toggleChecklistItem}
          />
        );
      case "password-checker":
        return <PasswordChecker />;
      default:
        return null;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Toaster
        theme={darkMode ? "dark" : "light"}
        position="bottom-right"
        toastOptions={{
          style: darkMode
            ? {
                background: "oklch(0.18 0.022 258)",
                border: "1px solid oklch(0.28 0.025 255)",
                color: "oklch(0.93 0.015 220)",
                opacity: 1,
              }
            : {
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                color: "#0f172a",
                opacity: 1,
              },
        }}
      />

      {/* Desktop sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        threatCount={activeThreats}
        protectionActive={isProtected}
      />

      {/* Mobile nav overlay */}
      <MobileNav
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        threatCount={activeThreats}
        protectionActive={isProtected}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          currentPage={currentPage}
          protectionActive={isProtected}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen((v) => !v)}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
        <div className="flex-1 overflow-y-auto">{renderPage()}</div>
        <Footer />
      </div>
    </div>
  );
}
