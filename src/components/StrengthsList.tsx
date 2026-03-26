import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface StrengthsListProps {
  strengths: string[];
}

const StrengthsList = ({ strengths }: StrengthsListProps) => {
  if (strengths.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="space-y-3"
    >
      <h3 className="text-xl font-display font-bold text-foreground">✅ נקודות חוזק</h3>
      <div className="space-y-2">
        {strengths.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.08 }}
            className="flex items-start gap-3 bg-card rounded-lg border border-success/20 p-3 shadow-card"
          >
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <p className="text-sm text-foreground" dir="rtl">{s}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StrengthsList;
