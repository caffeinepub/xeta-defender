import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type StrengthLevel = "empty" | "weak" | "fair" | "strong" | "very-strong";

interface StrengthResult {
  level: StrengthLevel;
  score: number;
  color: string;
  label: string;
  tips: string[];
}

function analyzePassword(password: string): StrengthResult {
  if (!password) {
    return {
      level: "empty",
      score: 0,
      color: "bg-muted",
      label: "Enter a password",
      tips: [],
    };
  }

  const tips: string[] = [];
  let score = 0;

  // Length checks
  if (password.length >= 8) score += 1;
  else tips.push("Use at least 8 characters (12+ is ideal)");
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  else if (password.length < 16)
    tips.push("Use 16+ characters for maximum security");

  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  if (hasLower) score += 1;
  else tips.push("Add lowercase letters (a-z)");
  if (hasUpper) score += 1;
  else tips.push("Add uppercase letters (A-Z)");
  if (hasDigit) score += 1;
  else tips.push("Include numbers (0-9)");
  if (hasSpecial) score += 2;
  else tips.push("Use special characters (!@#$%^&*)");

  // Common patterns (penalties)
  const commonPatterns = [
    "password",
    "123456",
    "qwerty",
    "abc123",
    "letmein",
    "admin",
    "welcome",
    "monkey",
    "dragon",
    "master",
  ];
  const lowerPass = password.toLowerCase();
  if (commonPatterns.some((p) => lowerPass.includes(p))) {
    score -= 2;
    tips.push("Avoid common words and patterns");
  }

  // Repeated characters
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    tips.push("Avoid repeating characters (e.g. aaa, 111)");
  }

  score = Math.max(0, Math.min(8, score));

  if (score <= 2) {
    return { level: "weak", score, color: "bg-xeta-red", label: "Weak", tips };
  }
  if (score <= 4) {
    return {
      level: "fair",
      score,
      color: "bg-xeta-amber",
      label: "Fair",
      tips,
    };
  }
  if (score <= 6) {
    return {
      level: "strong",
      score,
      color: "bg-primary",
      label: "Strong",
      tips,
    };
  }
  return {
    level: "very-strong",
    score,
    color: "bg-xeta-green",
    label: "Very Strong",
    tips,
  };
}

const STRENGTH_CONFIG: Record<
  Exclude<StrengthLevel, "empty">,
  { barColor: string; textColor: string; barCount: number }
> = {
  weak: {
    barColor: "bg-xeta-red",
    textColor: "text-xeta-red",
    barCount: 1,
  },
  fair: {
    barColor: "bg-xeta-amber",
    textColor: "text-xeta-amber",
    barCount: 2,
  },
  strong: {
    barColor: "bg-primary",
    textColor: "text-primary",
    barCount: 3,
  },
  "very-strong": {
    barColor: "bg-xeta-green",
    textColor: "text-xeta-green",
    barCount: 4,
  },
};

const REQUIREMENTS = [
  {
    id: "len8",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    id: "upper",
    label: "Uppercase letter (A-Z)",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    id: "lower",
    label: "Lowercase letter (a-z)",
    test: (p: string) => /[a-z]/.test(p),
  },
  { id: "digit", label: "Number (0-9)", test: (p: string) => /\d/.test(p) },
  {
    id: "special",
    label: "Special character (!@#$...)",
    test: (p: string) => /[^a-zA-Z0-9]/.test(p),
  },
  {
    id: "len16",
    label: "16+ characters (ideal)",
    test: (p: string) => p.length >= 16,
  },
];

export default function PasswordChecker() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const result = analyzePassword(password);

  const config =
    result.level !== "empty" ? STRENGTH_CONFIG[result.level] : null;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-base font-semibold text-foreground">
              Password Strength Checker
            </div>
            <div className="text-xs text-muted-foreground">
              Test your password security — nothing is stored or transmitted
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a password to check..."
            className="pr-10 text-sm font-mono bg-muted/50 border-border focus:border-primary/50"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Strength bars */}
        <AnimatePresence>
          {password && config && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Password strength
                </span>
                <span className={cn("text-sm font-bold", config.textColor)}>
                  {result.label}
                </span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className="flex-1 h-2 rounded-full bg-muted overflow-hidden"
                  >
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        bar <= config.barCount
                          ? config.barColor
                          : "bg-transparent",
                      )}
                      initial={{ width: 0 }}
                      animate={{
                        width: bar <= config.barCount ? "100%" : "0%",
                      }}
                      transition={{ duration: 0.3, delay: bar * 0.05 }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Requirements */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm font-semibold text-foreground mb-4">
            Requirements
          </div>
          <div className="space-y-2">
            {REQUIREMENTS.map((req, i) => {
              const met = password ? req.test(password) : false;
              return (
                <motion.div
                  key={req.id}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <AnimatePresence mode="wait">
                    {met ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-xeta-green flex-shrink-0" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="x"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <XCircle
                          className={cn(
                            "w-4 h-4 flex-shrink-0",
                            password
                              ? "text-xeta-red"
                              : "text-muted-foreground",
                          )}
                        />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span
                    className={cn(
                      "text-sm",
                      met
                        ? "text-xeta-green"
                        : password
                          ? "text-muted-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {req.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Tips / improvements */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm font-semibold text-foreground mb-4">
            Improvement Tips
          </div>
          {!password && (
            <div className="text-sm text-muted-foreground">
              Enter a password to see personalized tips.
            </div>
          )}
          {password && result.tips.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-xeta-green">
              <CheckCircle2 className="w-4 h-4" />
              No improvements needed — great password!
            </div>
          )}
          <div className="space-y-2">
            {result.tips.map((tip, i) => (
              <motion.div
                key={tip}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-xeta-amber flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{tip}</span>
              </motion.div>
            ))}
          </div>

          {/* Good practices */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Best Practices
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>• Use a unique password for every account</p>
              <p>• Consider using a password manager (Bitwarden, 1Password)</p>
              <p>• Enable 2FA wherever possible</p>
              <p>• Never share passwords via email or chat</p>
              <p>• Change passwords if a breach is reported</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
