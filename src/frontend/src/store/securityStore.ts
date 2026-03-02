// Security store — persists to localStorage

export type Severity = "Low" | "Medium" | "High" | "Critical";
export type ThreatStatus = "Active" | "Quarantined" | "Resolved";

export interface Threat {
  id: string;
  name: string;
  severity: Severity;
  status: ThreatStatus;
  path: string;
  date: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface SecurityState {
  realtimeProtection: boolean;
  cloudProtection: boolean;
  automaticSampleSubmission: boolean;
  firewallDomain: boolean;
  firewallPrivate: boolean;
  firewallPublic: boolean;
  reputationProtection: boolean;
  exploitProtection: boolean;
  coreIsolation: boolean;
  secureBootEnabled: boolean;
  threats: Threat[];
  checklist: ChecklistItem[];
  lastScanDate: string | null;
  lastScanType: string | null;
  lastScanThreatsFound: number;
}

const STORAGE_KEY = "xeta-defender-state";

const THREAT_NAMES = [
  "Trojan.GenericKD.47892",
  "Adware.Bundler.CrossRider",
  "PUP.Optional.Toolbar.IE",
  "Exploit.CVE-2023-4911",
  "Ransomware.WannaCrypt",
  "Spyware.AgentTesla",
  "Backdoor.Remcos.RAT",
  "Worm.Conficker.C",
  "Rootkit.ZeroAccess",
  "Trojan.FakeAV.Gen",
  "Adware.SearchProtect",
  "PUP.Optional.ChromeExtension",
  "Malware.Stealer.RedLine",
  "Virus.Win32.Sality",
  "Trojan.Downloader.Generic",
];

const THREAT_PATHS = [
  "C:\\Users\\User\\Downloads\\setup.exe",
  "C:\\Temp\\update.tmp",
  "C:\\ProgramData\\chrome_update.dll",
  "C:\\Users\\User\\AppData\\Local\\Temp\\svchost.exe",
  "C:\\Windows\\System32\\drivers\\net.sys",
  "C:\\Program Files\\Unknown\\bundle.exe",
];

const SEVERITIES: Severity[] = ["Low", "Medium", "High", "Critical"];

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: "2fa",
    title: "Enable 2FA on accounts",
    description:
      "Add two-factor authentication to email, banking, and social media accounts.",
    completed: false,
  },
  {
    id: "os-update",
    title: "Keep OS updated",
    description:
      "Install the latest Windows/macOS/Linux updates to patch security vulnerabilities.",
    completed: true,
  },
  {
    id: "strong-passwords",
    title: "Use strong passwords",
    description:
      "Use unique passwords of 12+ characters with a mix of letters, numbers, and symbols.",
    completed: false,
  },
  {
    id: "firewall",
    title: "Enable firewall",
    description:
      "Ensure your system firewall is active to block unauthorized network access.",
    completed: true,
  },
  {
    id: "backup",
    title: "Backup your data",
    description:
      "Maintain regular backups of important files to an external drive or cloud storage.",
    completed: false,
  },
  {
    id: "vpn",
    title: "Use a VPN on public WiFi",
    description:
      "Always connect through a trusted VPN when using public networks.",
    completed: false,
  },
  {
    id: "app-permissions",
    title: "Review app permissions",
    description:
      "Regularly audit which apps have access to your camera, microphone, location, and contacts.",
    completed: false,
  },
];

const INITIAL_THREATS: Threat[] = [
  {
    id: "t1",
    name: "Adware.Bundler.CrossRider",
    severity: "Medium",
    status: "Quarantined",
    path: "C:\\Users\\User\\Downloads\\setup.exe",
    date: "2026-02-28",
  },
  {
    id: "t2",
    name: "PUP.Optional.Toolbar.IE",
    severity: "Low",
    status: "Resolved",
    path: "C:\\Program Files\\Unknown\\bundle.exe",
    date: "2026-02-25",
  },
  {
    id: "t3",
    name: "Trojan.GenericKD.47892",
    severity: "High",
    status: "Quarantined",
    path: "C:\\Temp\\update.tmp",
    date: "2026-02-20",
  },
];

const DEFAULT_STATE: SecurityState = {
  realtimeProtection: true,
  cloudProtection: true,
  automaticSampleSubmission: false,
  firewallDomain: true,
  firewallPrivate: true,
  firewallPublic: true,
  reputationProtection: true,
  exploitProtection: true,
  coreIsolation: false,
  secureBootEnabled: true,
  threats: INITIAL_THREATS,
  checklist: DEFAULT_CHECKLIST,
  lastScanDate: "2026-03-01T09:15:00Z",
  lastScanType: "Quick Scan",
  lastScanThreatsFound: 0,
};

export function loadState(): SecurityState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<SecurityState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      // Always merge checklist items to ensure new items appear
      checklist: DEFAULT_STATE.checklist.map((def) => {
        const saved = (parsed.checklist ?? []).find((c) => c.id === def.id);
        return saved ? { ...def, completed: saved.completed } : def;
      }),
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: SecurityState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

export function generateThreat(id: string): Threat {
  const name = THREAT_NAMES[Math.floor(Math.random() * THREAT_NAMES.length)];
  const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
  const path = THREAT_PATHS[Math.floor(Math.random() * THREAT_PATHS.length)];
  const now = new Date().toISOString().split("T")[0];
  return {
    id,
    name,
    severity,
    status: "Active",
    path,
    date: now,
  };
}
