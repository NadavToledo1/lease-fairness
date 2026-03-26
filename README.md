# 🏠 RentCheck AI
### **Is your rental contract fair or "Draconian"?**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![AI-Powered](https://img.shields.io/badge/AI-Powered-green.svg)]()

**RentCheck AI** is a smart legal-tech tool designed to empower tenants in the rental market. Using LLMs and legal heuristics, it analyzes rental agreements, identifies "red flags," and provides a fairness score based on the **Israeli Fair Rental Law (2017)**.

---

## 🚀 Features

* **Automated Analysis:** Upload a contract (PDF/Text) and get an instant summary.
* **Fairness Scoring:** A scale from **1 (Draconian)** to **10 (Tenant-Friendly)**.
* **Red Flag Detection:** Automatically highlights illegal or predatory clauses (e.g., unfair repairs, excessive guarantees).
* **Legal Alignment:** Checks clauses against the Israeli Fair Rental Law.
* **Actionable Advice:** Suggests counter-proposals for problematic sections.

---

## 🛠️ How It Works

The system follows a multi-stage pipeline to ensure accuracy and privacy:

1.  **Text Extraction:** OCR and parsing of the rental agreement.
2.  **Anonymization:** Stripping PII (Names, IDs, Bank details) for privacy.
3.  **Semantic Analysis:** Classification of clauses using an LLM (GPT-4 / Gemini / Claude).
4.  **Scoring Engine:** Comparing extracted data against "Golden Standard" fair contracts.

---

## 🏗️ Tech Stack

* **Backend:** Python
* **AI Engine:** OpenAI API / LangChain (RAG implementation)
* **Framework:** FastAPI / Flask
* **Frontend:** Streamlit / React (Optional)

---

## 📋 Example Red Flags Detected

| Clause Type | Problematic Language (Red Flag) | Fair Standard |
| :--- | :--- | :--- |
| **Repairs** | "Tenant responsible for all wear and tear." | Landlord covers structural & basic wear. |
| **Notice Period** | "Landlord may terminate with 30 days notice." | Minimum 90 days for landlord (by law). |
| **Guarantees** | "Deposit of 6 months' rent in cash." | Capped at 3 months or 1/3 of annual rent. |

---

## 🏁 Getting Started

### Prerequisites
* Python 3.9+
* API Key (OpenAI / Google AI)

### Installation
```bash
# Clone the repository
git clone [https://github.com/your-username/rentcheck-ai.git](https://github.com/your-username/rentcheck-ai.git)

# Install dependencies
pip install -r requirements.txt

# Run the app
python main.py
