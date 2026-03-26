import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number; // 1-10
  label: string;
}

const ScoreGauge = ({ score, label }: ScoreGaugeProps) => {
  const percentage = ((score - 1) / 9) * 100;

  const getScoreColor = () => {
    if (score <= 3) return "text-destructive";
    if (score <= 5) return "text-warning";
    return "text-success";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <motion.circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - percentage / 100) }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(0 72% 51%)" />
              <stop offset="50%" stopColor="hsl(38 92% 50%)" />
              <stop offset="100%" stopColor="hsl(152 55% 42%)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-4xl font-bold font-display ${getScoreColor()}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground font-body">/10</span>
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground text-center max-w-[200px]">{label}</p>
    </div>
  );
};

export default ScoreGauge;
