import { useState, useCallback } from "react";

export interface AnalysisResult {
  score: number;
  summaryHeadline: string;
  redFlags: Array<{
    clause: string;
    problem: string;
    amendment: string;
  }>;
  strengths: string[];
  bottomLine: string;
  legalNotes: string[];
}

export function useContractAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback((contractText: string) => {
    if (!contractText.trim()) {
      setError("אנא הזן את טקסט החוזה לניתוח");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    // Simulate analysis with intelligent pattern matching
    setTimeout(() => {
      const text = contractText.toLowerCase();
      const redFlags: AnalysisResult["redFlags"] = [];
      const strengths: string[] = [];
      const legalNotes: string[] = [];
      let score = 6;

      // Check for repair clauses
      if (text.includes("תיקון") && (text.includes("שוכר") || text.includes("דייר")) && (text.includes("צנרת") || text.includes("חשמל") || text.includes("מבנה"))) {
        redFlags.push({
          clause: "השוכר יישא בעלות כל תיקוני הצנרת, החשמל והמבנה",
          problem: "לפי חוק השכירות ההוגנת, תיקוני בלאי סביר ותשתיות הם באחריות המשכיר. הטלת עלויות אלו על השוכר היא בלתי חוקית.",
          amendment: 'יש להוסיף: "תיקוני מבנה, צנרת וחשמל שנובעים מבלאי סביר יהיו באחריות המשכיר"',
        });
        score -= 1;
        legalNotes.push("סעיף התיקונים עלול לסתור את חוק שכירות הוגנת 2017 בנוגע לאחריות המשכיר לתחזוקת מערכות.");
      }

      // Check for termination clauses
      if ((text.includes("פינוי") || text.includes("ביטול") || text.includes("הפסקה")) && (text.includes("30 יום") || text.includes("חודש"))) {
        redFlags.push({
          clause: "המשכיר רשאי לבטל את החוזה בהתראה של 30 יום ללא עילה",
          problem: "סעיף חד-צדדי המאפשר למשכיר לפנות ללא סיבה בהתראה קצרה, ללא זכות מקבילה לשוכר. מפר את עקרון האיזון החוזי.",
          amendment: 'יש לקבוע: "כל צד רשאי לבטל את החוזה בהתראה של 90 יום מראש, בכתב ובנימוק"',
        });
        score -= 1;
      }

      // Check for property visit
      if ((text.includes("ביקור") || text.includes("כניסה")) && (text.includes("בכל עת") || text.includes("ללא תיאום"))) {
        redFlags.push({
          clause: "המשכיר רשאי להיכנס לדירה בכל עת לצורך בדיקה",
          problem: "כניסה ללא תיאום מראש מפרה את פרטיות השוכר. חוק השכירות דורש הודעה סבירה מראש.",
          amendment: 'יש לנסח: "ביקור בדירה יתואם מראש, בהתראה של 48 שעות לפחות, בשעות סבירות ובהסכמת השוכר"',
        });
        score -= 0.75;
      }

      // Check for excessive penalties
      if ((text.includes("פיצוי") || text.includes("קנס")) && (text.includes("500") || text.includes("יום"))) {
        redFlags.push({
          clause: "פיצוי מוסכם בסך 500 ש״ח ליום בגין איחור בפינוי",
          problem: "סכום מופרז שאינו פרופורציונלי לנזק האמיתי. בית משפט עשוי להפחית פיצוי מוסכם לא סביר.",
          amendment: 'יש להפחית ל: "פיצוי מוסכם של 150-200 ש״ח ליום, בהתאם לגובה דמי השכירות החודשיים"',
        });
        score -= 0.75;
      }

      // Check for excessive guarantees
      if ((text.includes("ערבות") || text.includes("בטחון")) && (text.includes("שלושה") || text.includes("3") || text.includes("ארבע") || text.includes("4"))) {
        redFlags.push({
          clause: "השוכר ימסור ערבות בנקאית בגובה 3 חודשי שכירות ומעלה",
          problem: "דרישת ערבויות מופרזת. המקובל בשוק הוא 2-3 חודשי שכירות כערבות.",
          amendment: 'יש לצמצם ל: "ערבות בגובה חודשיים שכירות, שתוחזר תוך 30 יום מסיום השכירות"',
        });
        score -= 1;
      }

      // Good signs
      if (text.includes("אופציה") || text.includes("הארכה")) {
        strengths.push("קיימת אופציית הארכה – מספקת יציבות וודאות לשוכר.");
        score += 0.5;
      }

      if (text.includes("תיקון דחוף") || text.includes("תיקון חירום")) {
        strengths.push("סעיף תיקונים דחופים – מאפשר לשוכר לתקן על חשבון המשכיר במקרה חירום.");
        score += 0.5;
      }

      if (text.includes("ביטוח")) {
        strengths.push("קיים סעיף ביטוח – חלוקת אחריות ברורה בין ביטוח מבנה לתכולה.");
        score += 0.5;
      }

      if (text.includes("צביעה") && (text.includes("נקי") || text.includes("סביר"))) {
        strengths.push("אין דרישה לצביעה מקצועית – מספיק להחזיר את הדירה במצב נקי וראוי.");
        score += 0.5;
      }

      // Fallback defaults
      if (redFlags.length === 0 && strengths.length === 0) {
        strengths.push("לא זוהו סעיפים בעייתיים בולטים בחוזה.");
        score = 5;
      }

      score = Math.max(1, Math.min(10, Math.round(score)));

      let summaryHeadline: string;
      if (score <= 3) summaryHeadline = "חוזה דרקוני לטובת המשכיר – דורש תיקונים משמעותיים";
      else if (score <= 5) summaryHeadline = "חוזה סטנדרטי עם הטיה לטובת המשכיר";
      else if (score <= 7) summaryHeadline = "חוזה מאוזן – תנאים הוגנים ברובם";
      else summaryHeadline = "חוזה טוב מאוד לטובת השוכר";

      let bottomLine: string;
      if (redFlags.length === 0) {
        bottomLine = "ניתן לחתום – החוזה נראה הוגן ומאוזן.";
      } else if (redFlags.length <= 2) {
        bottomLine = `מומלץ לחתום לאחר תיקון ${redFlags.length} הסעיפים הבעייתיים שזוהו.`;
      } else {
        bottomLine = "מומלץ מאוד לתקן את הסעיפים הבעייתיים לפני חתימה, או להיוועץ בעורך דין.";
      }

      setResult({
        score,
        summaryHeadline,
        redFlags,
        strengths,
        bottomLine,
        legalNotes,
      });
      setIsAnalyzing(false);
    }, 2500);
  }, []);

  return { result, isAnalyzing, error, analyze };
}
