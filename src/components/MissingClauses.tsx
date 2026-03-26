import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";

interface MissingClausesProps {
  clauses: string[];
}

const MissingClauses = ({ clauses }: MissingClausesProps) => {
  if (!clauses || clauses.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-accent" />
        <h3 className="text-xl font-display font-bold text-foreground">
          סעיפים שכדאי לדרוש
        </h3>
      </div>
      <div className="bg-card rounded-lg border border-accent/20 p-4 shadow-card">
        <p className="text-xs text-muted-foreground mb-3">
          סעיפים שלא קיימים בחוזה אך מומלץ להוסיף לפני חתימה:
        </p>
        <ul className="space-y-2">
          {clauses.map((clause, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.07 }}
              className="flex items-start gap-2 text-sm text-foreground"
              dir="rtl"
            >
              <span className="text-accent font-bold shrink-0 mt-0.5">+</span>
              <span>{clause}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default MissingClauses;
