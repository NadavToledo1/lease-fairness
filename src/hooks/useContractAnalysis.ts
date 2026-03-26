import { useState, useCallback } from "react";

export interface RedFlag {
  clause: string;
  problem: string;
  amendment: string;
  severity: "high" | "medium" | "low";
}

export interface AnalysisResult {
  score: number;
  summaryHeadline: string;
  redFlags: RedFlag[];
  strengths: string[];
  bottomLine: string;
  legalNotes: string[];
  missingClauses: string[];
}

const SYSTEM_PROMPT = `אתה עורך דין ישראלי המתמחה בדיני שכירות. תפקידך לנתח חוזי שכירות בעברית ולספק ניתוח מקצועי, מאוזן ומדויק.

עליך להחזיר תשובה בפורמט JSON בלבד, ללא טקסט נוסף, לפי המבנה הבא:

{
  "score": <מספר שלם 1-10, כאשר 10 = הוגן לחלוטין לשוכר, 1 = דרקוני לטובת המשכיר>,
  "summaryHeadline": "<משפט קצר המסכם את אופי החוזה>",
  "redFlags": [
    {
      "clause": "<ציטוט או תיאור הסעיף הבעייתי>",
      "problem": "<הסבר מדוע הסעיף בעייתי, כולל הפנייה לחוק הרלוונטי אם ישים>",
      "amendment": "<נוסח תיקון מוצע>",
      "severity": "<high | medium | low>"
    }
  ],
  "strengths": ["<נקודת חוזק 1>", "<נקודת חוזק 2>", ...],
  "bottomLine": "<המלצה סופית ברורה — האם לחתום, לנסות לתקן, או להימנע>",
  "legalNotes": ["<הערה משפטית חשובה 1>", ...],
  "missingClauses": ["<סעיף שחסר בחוזה וחשוב לדרוש>", ...]
}

הנחיות לניתוח:
- בדוק את החוזה מול חוק השכירות והשאילה התשל"א-1971, חוק שכירות הוגנת תשנ"ז-1997 ותיקוניו
- זהה סעיפים חד-צדדיים לטובת המשכיר
- שים לב לאחריות תיקונים (בלאי סביר — על המשכיר), כניסה לדירה, סיום חוזה, ערבויות מופרזות, פיצויים לא פרופורציונליים
- בדוק חסרים: ביטוח, אופציה, מנגנון עדכון שכ"ד, פרוטוקול מסירה
- הציון: 7-10 = חוזה הוגן, 4-6 = חוזה סטנדרטי עם בעיות, 1-3 = חוזה בעייתי מאוד
- אם הטקסט אינו חוזה שכירות, החזר score: 0 עם הודעה מתאימה ב-summaryHeadline
- החזר JSON תקני בלבד, ללא markdown backticks`;

export function useContractAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (contractText: string) => {
    if (!contractText.trim()) {
      setError("אנא הזן את טקסט החוזה לניתוח");
      return;
    }

    if (contractText.trim().length < 100) {
      setError("הטקסט קצר מדי לניתוח — אנא הדבק את החוזה המלא");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string;
      if (!apiKey) {
        throw new Error(
          "מפתח API חסר — הגדר VITE_ANTHROPIC_API_KEY בקובץ .env.local"
        );
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `נתח את חוזה השכירות הבא:\n\n${contractText.slice(0, 12000)}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error("שגיאת הרשאה — בדוק את מפתח ה-API");
        } else if (response.status === 429) {
          throw new Error("יותר מדי בקשות — נסה שוב עוד רגע");
        } else if (response.status >= 500) {
          throw new Error("שגיאת שרת זמנית — נסה שוב");
        }
        throw new Error(
          (errData as { error?: { message?: string } })?.error?.message ||
            "שגיאה בניתוח החוזה"
        );
      }

      const data = await response.json();
      const rawText = data.content
        ?.map((block: { type: string; text?: string }) =>
          block.type === "text" ? block.text : ""
        )
        .filter(Boolean)
        .join("");

      if (!rawText) throw new Error("לא התקבלה תשובה מהשרת");

      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      let parsed: AnalysisResult;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        throw new Error("שגיאה בפענוח תשובת הניתוח — נסה שוב");
      }

      // Validate and sanitise
      if (
        typeof parsed.score !== "number" ||
        parsed.score < 0 ||
        parsed.score > 10
      ) {
        throw new Error("תשובה לא תקינה התקבלה — נסה שוב");
      }

      if (parsed.score === 0) {
        setError(
          parsed.summaryHeadline ||
            "הטקסט שהוזן אינו נראה כחוזה שכירות. אנא הדבק חוזה שכירות תקין."
        );
        setIsAnalyzing(false);
        return;
      }

      setResult({
        score: Math.round(Math.max(1, Math.min(10, parsed.score))),
        summaryHeadline: parsed.summaryHeadline || "",
        redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        bottomLine: parsed.bottomLine || "",
        legalNotes: Array.isArray(parsed.legalNotes) ? parsed.legalNotes : [],
        missingClauses: Array.isArray(parsed.missingClauses)
          ? parsed.missingClauses
          : [],
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "שגיאה לא צפויה — נסה שוב"
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return { result, isAnalyzing, error, analyze, reset };
}
