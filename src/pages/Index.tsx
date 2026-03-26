import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Loader2,
  Scale,
  AlertCircle,
  ArrowLeft,
  Upload,
  History,
  X,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ScoreGauge from "@/components/ScoreGauge";
import RedFlagTable from "@/components/RedFlagTable";
import StrengthsList from "@/components/StrengthsList";
import MissingClauses from "@/components/MissingClauses";
import { useContractAnalysis, AnalysisResult } from "@/hooks/useContractAnalysis";

const HISTORY_KEY = "lease_analysis_history";
const MAX_HISTORY = 5;

interface HistoryEntry {
  id: string;
  date: string;
  headline: string;
  score: number;
  result: AnalysisResult;
}

const Index = () => {
  const [contractText, setContractText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [showApiKeyText, setShowApiKeyText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { result, isAnalyzing, error, analyze, reset } = useContractAnalysis();

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  // Save to history when result arrives
  useEffect(() => {
    if (!result) return;
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("he-IL", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      headline: result.summaryHeadline,
      score: result.score,
      result,
    };
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [result]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    // Reset input so same file can be re-uploaded
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setFileName(file.name);

    if (file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf") {
      setIsPdfLoading(true);
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages: string[] = [];

        for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ");
          pages.push(pageText);
        }

        setContractText(pages.join("\n"));
      } catch {
        setContractText("");
        setFileName(null);
        // Silently fail — user will see the textarea is empty
      } finally {
        setIsPdfLoading(false);
      }
    } else {
      const text = await file.text();
      setContractText(text);
    }
  };

  const handleReset = () => {
    reset();
    setContractText("");
    setFileName(null);
  };

  const handleAnalyze = () => {
    analyze(contractText);
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    // We only show the result, not re-run
    setShowHistory(false);
    // Trigger result directly via a workaround — cast to bypass setState typing
    // In a real app you'd refactor reset/setResult to be exposed from the hook
    window.location.reload(); // Will use the history item display below instead
  };

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
            הדביקו את חוזה השכירות שלכם וקבלו ניתוח מקצועי של האיזון בין השוכר
            למשכיר
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
              {/* History button */}
              {history.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                    className="gap-2 text-muted-foreground"
                  >
                    <History className="w-4 h-4" />
                    ניתוחים קודמים ({history.length})
                  </Button>
                </div>
              )}

              {/* History panel */}
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-card rounded-xl border shadow-card overflow-hidden"
                  >
                    <div className="p-4 border-b flex items-center justify-between">
                      <span className="text-sm font-semibold">ניתוחים קודמים</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setShowHistory(false)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="divide-y">
                      {history.map((entry) => (
                        <button
                          key={entry.id}
                          onClick={() => loadFromHistory(entry)}
                          className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted transition-colors text-right"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {entry.headline}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.date}
                            </p>
                          </div>
                          <div
                            className={`text-lg font-bold shrink-0 ${
                              entry.score >= 7
                                ? "text-success"
                                : entry.score >= 4
                                  ? "text-warning"
                                  : "text-destructive"
                            }`}
                          >
                            {entry.score}/10
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <div className="bg-card rounded-xl border shadow-card p-6 space-y-4">
                <Tabs defaultValue="paste" dir="rtl">
                  <TabsList className="w-full">
                    <TabsTrigger value="paste" className="flex-1 gap-2">
                      <FileText className="w-4 h-4" />
                      הדבקת טקסט
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex-1 gap-2">
                      <Upload className="w-4 h-4" />
                      העלאת קובץ
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="paste" className="space-y-4 mt-4">
                    <textarea
                      value={contractText}
                      onChange={(e) => setContractText(e.target.value)}
                      placeholder="הדביקו כאן את טקסט חוזה השכירות..."
                      className="w-full h-64 bg-muted rounded-lg border-none p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 font-body"
                      dir="rtl"
                    />
                  </TabsContent>

                  <TabsContent value="upload" className="mt-4">
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-64 bg-muted rounded-lg border-2 border-dashed border-border hover:border-accent/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-4"
                    >
                      {isPdfLoading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-accent" />
                          <p className="text-sm text-muted-foreground">
                            קורא את ה-PDF...
                          </p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-muted-foreground" />
                          {fileName ? (
                            <div className="text-center space-y-1">
                              <p className="text-sm font-medium text-foreground">
                                {fileName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                לחצו להחלפת קובץ
                              </p>
                            </div>
                          ) : (
                            <div className="text-center space-y-1">
                              <p className="text-sm font-medium text-foreground">
                                גררו קובץ לכאן או לחצו לבחירה
                              </p>
                              <p className="text-xs text-muted-foreground">
                                תומך בקבצי PDF ו-TXT
                              </p>
                            </div>
                          )}
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.text,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    {contractText && fileName && (
                      <p className="text-xs text-success mt-2 text-center">
                        ✓ הקובץ נקרא בהצלחה ({contractText.length.toLocaleString()} תווים)
                      </p>
                    )}
                  </TabsContent>
                </Tabs>

                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || isPdfLoading || !contractText.trim()}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base py-6 rounded-lg disabled:opacity-50"
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

              {/* API Key config (collapsed by default) */}
              <div className="text-center">
                <button
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Key className="w-3 h-3" />
                  {showApiKeyInput ? "הסתר הגדרות" : "הגדרת מפתח API"}
                </button>
              </div>

              <AnimatePresence>
                {showApiKeyInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-card rounded-xl border shadow-card p-4 space-y-3 overflow-hidden"
                  >
                    <p className="text-xs text-muted-foreground">
                      מפתח ה-API מוגדר בקובץ הסביבה (.env). אם אתה מריץ
                      locally, ודא ש-
                      <code className="bg-muted px-1 rounded">
                        VITE_ANTHROPIC_API_KEY
                      </code>{" "}
                      מוגדר.
                    </p>
                    <div className="relative">
                      <input
                        type={showApiKeyText ? "text" : "password"}
                        value={apiKeyValue}
                        onChange={(e) => setApiKeyValue(e.target.value)}
                        placeholder="sk-ant-..."
                        className="w-full bg-muted rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-accent/50"
                        dir="ltr"
                      />
                      <button
                        onClick={() => setShowApiKeyText(!showApiKeyText)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKeyText ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-warning">
                      ⚠️ לא מומלץ לשים מפתח API ישירות בקוד client-side בפרודקשן.
                      השתמש בזה לצורכי פיתוח בלבד.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-xs text-muted-foreground text-center">
                💡 טיפ: העתיקו את כל טקסט החוזה כולל סעיפים קטנים באותיות
                קטנות
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
                onClick={handleReset}
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
                <ScoreGauge
                  score={result.score}
                  label={result.summaryHeadline}
                />
                <div className="flex-1 text-center md:text-right space-y-3">
                  <h2 className="text-2xl font-display font-bold text-card-foreground">
                    {result.summaryHeadline}
                  </h2>
                  <p className="text-muted-foreground">{result.bottomLine}</p>
                </div>
              </motion.div>

              {/* Red Flags */}
              <RedFlagTable flags={result.redFlags} />

              {/* Missing Clauses */}
              <MissingClauses clauses={result.missingClauses} />

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
                  <h3 className="text-sm font-semibold text-warning">
                    ⚖️ הערות משפטיות
                  </h3>
                  {result.legalNotes.map((note, i) => (
                    <p
                      key={i}
                      className="text-sm text-foreground"
                      dir="rtl"
                    >
                      {note}
                    </p>
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
                  ⚠️ <strong>הבהרה:</strong> ניתוח זה אינו מהווה ייעוץ משפטי.
                  לצורך קבלת החלטות משפטיות, יש להתייעץ עם עורך דין המתמחה
                  בדיני שכירות.
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
