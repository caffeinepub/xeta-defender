import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@/store/securityStore";
import { CheckCircle2, CheckSquare, Circle, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface SecurityChecklistProps {
  checklist: ChecklistItem[];
  onToggleItem: (id: string) => void;
}

export default function SecurityChecklist({
  checklist,
  onToggleItem,
}: SecurityChecklistProps) {
  const completed = checklist.filter((c) => c.completed).length;
  const total = checklist.length;
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Progress header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">
                Security Hardening Checklist
              </div>
              <div className="text-xs text-muted-foreground">
                Complete these steps to improve your security posture
              </div>
            </div>
          </div>
          <div className="text-right">
            <div
              className={cn(
                "text-2xl font-bold",
                percentage === 100
                  ? "text-xeta-green"
                  : percentage >= 60
                    ? "text-primary"
                    : "text-xeta-amber",
              )}
            >
              {percentage}%
            </div>
            <div className="text-xs text-muted-foreground">
              {completed} / {total} done
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              percentage === 100
                ? "bg-xeta-green"
                : percentage >= 60
                  ? "bg-primary"
                  : "bg-xeta-amber",
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {percentage === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-xeta-green/10 border border-xeta-green/25"
          >
            <TrendingUp className="w-4 h-4 text-xeta-green" />
            <span className="text-sm text-xeta-green font-medium">
              Excellent! All security best practices completed.
            </span>
          </motion.div>
        )}
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {checklist.map((item, i) => (
            <motion.button
              key={item.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onToggleItem(item.id)}
              className={cn(
                "w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all group",
                item.completed
                  ? "border-xeta-green/20 bg-xeta-green/5 hover:bg-xeta-green/8"
                  : "border-border bg-card hover:border-primary/30 hover:bg-muted/40",
              )}
            >
              <div className="mt-0.5 flex-shrink-0">
                <AnimatePresence mode="wait">
                  {item.completed ? (
                    <motion.span
                      key="checked"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-xeta-green" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="unchecked"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    item.completed
                      ? "text-xeta-green line-through decoration-xeta-green/50"
                      : "text-foreground group-hover:text-primary",
                  )}
                >
                  {item.title}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div
                className={cn(
                  "flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded",
                  item.completed
                    ? "bg-xeta-green/15 text-xeta-green"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {item.completed ? "Done" : "Pending"}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
