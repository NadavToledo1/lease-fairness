import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, Scale, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScoreGauge from "@/components/ScoreGauge";
import RedFlagTable from "@/components/RedFlagTable";
import StrengthsList from "@/components/StrengthsList";
import { useContractAnalysis } from "@/hooks/useContractAnalysis";

const Index = () => {
  const [contractText, setContractText] = useState("");
  const { result, isAnalyzing, error, analyze } = useContractAnalysis();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-hero text-primary-foreground">
        <div className="container max-w-4xl mx-auto px-6 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Scale className="w-8 h-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              מנתח חוזי שכירות חכם
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-primary-foreground/70 font-body max-w-lg mx-auto"
          >
            הדביקו את חוזה השכירות שלכם וקבלו ניתוח מקצועי של האיזון בין השוכר למשכיר
          </motion.p>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-6 py-10 space-y-8">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              {/* Input Area */}
              <div className="bg-card rounded-xl border shadow-card p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-display font-semibold text-card-foreground">טקסט החוזה</h2>
                </div>
                <textarea
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  placeholder="הדביקו כאן את טקסט חוזה השכירות..."
                  className="w-full h-64 bg-muted rounded-lg border-none p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 font-body"
                  dir="rtl"
                />
                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
                <Button
                  onClick={() => analyze(contractText)}
                  disabled={isAnalyzing}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base py-6 rounded-lg"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      מנתח את החוזה...
                    </span>
                  ) : (
                    "נתח את החוזה"
                  )}
                </Button>
              </div>

              {/* Sample text hint */}
              <p className="text-xs text-muted-foreground text-center">
                💡 טיפ: העתיקו את כל טקסט החוזה כולל סעיפים קטנים באותיות קטנות
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Back button */}
              <Button
                variant="ghost"
                onClick={() => window.location.reload()}
                className="text-muted-foreground hover:text-foreground gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                ניתוח חוזה חדש
              </Button>

              {/* Score & Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border shadow-elevated p-8 flex flex-col md:flex-row items-center gap-8"
              >
                <ScoreGauge score={result.score} label={result.summaryHeadline} />
                <div className="flex-1 text-center md:text-right space-y-3">
                  <h2 className="text-2xl font-display font-bold text-card-foreground">{result.summaryHeadline}</h2>
                  <p className="text-muted-foreground">{result.bottomLine}</p>
                </div>
              </motion.div>

              {/* Red Flags */}
              <RedFlagTable flags={result.redFlags} />

              {/* Strengths */}
              <StrengthsList strengths={result.strengths} />

              {/* Legal Notes */}
              {result.legalNotes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-warning/10 border border-warning/30 rounded-lg p-4 space-y-2"
                >
                  <h3 className="text-sm font-semibold text-warning">⚖️ הערות משפטיות</h3>
                  {result.legalNotes.map((note, i) => (
                    <p key={i} className="text-sm text-foreground" dir="rtl">{note}</p>
                  ))}
                </motion.div>
              )}

              {/* Disclaimer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="bg-muted rounded-lg p-4 text-center"
              >
                <p className="text-xs text-muted-foreground">
                  ⚠️ <strong>הבהרה:</strong> ניתוח זה אינו מהווה ייעוץ משפטי. לצורך קבלת החלטות משפטיות, יש להתייעץ עם עורך דין המתמחה בדיני שכירות.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
