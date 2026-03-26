import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { RedFlag } from "@/hooks/useContractAnalysis";

interface RedFlagTableProps {
  flags: RedFlag[];
}

const severityLabel: Record<RedFlag["severity"], string> = {
  high: "חמור",
  medium: "בינוני",
  low: "קל",
};

const severityClass: Record<RedFlag["severity"], string> = {
  high: "bg-destructive/10 border-destructive/30 text-destructive",
  medium: "bg-warning/10 border-warning/30 text-warning",
  low: "bg-muted border-border text-muted-foreground",
};

const RedFlagTable = ({ flags }: RedFlagTableProps) => {
  if (flags.length === 0) return null;

  const sorted = [...flags].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h3 className="text-xl font-display font-bold text-foreground">
          דגלים אדומים
        </h3>
        <span className="text-sm text-muted-foreground">
          ({flags.length} סעיפים בעייתיים)
        </span>
      </div>
      <div className="space-y-3">
        {sorted.map((flag, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="bg-card rounded-lg border border-destructive/20 p-4 shadow-card space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
                  סעיף בעייתי
                </span>
                <p
                  className="text-sm text-foreground mt-1 font-medium"
                  dir="rtl"
                >
                  "{flag.clause}"
                </p>
              </div>
              {flag.severity && (
                <span
                  className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${severityClass[flag.severity]}`}
                >
                  {severityLabel[flag.severity]}
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-warning">
                למה זה בעייתי
              </span>
              <p className="text-sm text-muted-foreground mt-1" dir="rtl">
                {flag.problem}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-success">
                תיקון מוצע
              </span>
              <p className="text-sm text-muted-foreground mt-1" dir="rtl">
                {flag.amendment}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RedFlagTable;
