# DESIGN.md

## 📌 Project: Plagiarism + AI Content Checker SaaS

This document describes the full design, architecture, and technology stack for the SaaS project that allows schools/universities to detect plagiarism and AI-generated assignments.

---

## 🎯 Goals

* Detect AI-generated assignments (ChatGPT/GPT-like).
* Detect plagiarism from internal databases (past submissions) and web sources.
* Provide reports (AI probability %, plagiarism %, highlighted sections).
* SaaS model for schools/universities with multi-tenant support.

---

## ⚙️ Tech Stack

### Frontend

* **Framework**: React (Vite)
* **Styling**: Tailwind CSS + shadcn/ui
* **Charts/Reports**: Recharts or Chart.js
* **PDF Report Generation**: jsPDF (frontend export option)

### Backend

* **Node.js (Express)** → API orchestration layer
* **Deployment**: Render (serverless hosting)
* **Authentication**: Supabase Auth
* **Payments**: Stripe (SaaS billing)

### External APIs

* **Plagiarism Detection**: Copyleaks / PlagScan / Unicheck
* **AI Content Detection (Sentence Highlighting)**: OpenAI API / Gemini API
* **AI Content Detection (Overall Probability)**: Hugging Face AI detection models (e.g., roberta-base-openai-detector)

### Database & Storage

* **Supabase PostgreSQL** → users, schools, reports, submissions
* **Supabase Storage** → assignment file uploads (PDF/DOCX/TXT)

---

## 🏗️ System Architecture

```
React (Frontend)
   ↓ (file upload / request)
Node.js Backend (Render)
   - Auth (Supabase)
   - Reports & dashboard
   - Billing (Stripe)
   - API Orchestration
   ↓
External APIs:
   - Plagiarism API (Copyleaks/PlagScan)
   - OpenAI/Gemini API (AI sentence highlighting)
   - Hugging Face API (AI probability score)
   ↓
Supabase (DB + Storage)
```

---

## 📂 API Routes

### Authentication

* `POST /auth/signup`
* `POST /auth/login`
* `GET /auth/user`

### Assignments

* `POST /assignments/upload` → Upload PDF/DOCX/TXT
* `GET /assignments/:id` → Get assignment + report

### Reports

* `POST /reports/generate` → Run AI + plagiarism check
* `GET /reports/:id` → Fetch plagiarism & AI report

### Billing

* `POST /billing/subscribe`
* `GET /billing/status`

---

## 🔄 Workflow

### 1. Upload

* Teacher uploads assignment via frontend.
* File is stored in **Supabase Storage**.
* Text extracted and sent to backend.

### 2. AI Detection

* **OpenAI/Gemini API** → returns per-sentence annotations: `{ "text": "sentence1", "ai": true }`.
* **Hugging Face API** → returns overall AI probability (e.g., 0.85).

### 3. Plagiarism Detection

* Send text → **Plagiarism API (Copyleaks/PlagScan)**.
* Returns matches with sources, similarity scores, and highlighted segments.

### 4. Report Generation

* Backend aggregates results:

```json
{
  "ai_probability": 0.85,
  "ai_highlight": [{"text": "sentence1", "ai": true}, ...],
  "plagiarism_highlight": [{"text": "copied text", "source": "URL", "score": 0.9}, ...]
}
```

* Stored in Supabase PostgreSQL.

### 5. Frontend Display

* Teacher views results in dashboard.
* Highlight AI-generated sentences (red).
* Highlight plagiarized sentences (blue).
* Show overall AI probability and plagiarism %.
* Option to download a **PDF report**.

---

## 📊 Example Report Output

```json
{
  "assignmentId": "abc123",
  "ai_probability": 0.85,
  "ai_highlight": [
    {"text": "This is an AI-like sentence.", "ai": true},
    {"text": "This looks human.", "ai": false}
  ],
  "plagiarism_highlight": [
    {"text": "Plagiarized sentence.", "source": "https://wikipedia.org/...", "score": 0.92}
  ],
  "verdict": "Likely AI-generated with moderate plagiarism"
}
```

---

## 🚀 Future Improvements

* Fine-tune AI detection models for academic writing.
* Multi-institution plagiarism DB sharing.
* Real-time Chrome extension for teachers.
* Multilingual support.

---

✅ This **DESIGN.md** defines the SaaS MVP using **React + Tailwind + Supabase + Node.js** with integrations to **OpenAI/Gemini, Hugging Face, and plagiarism APIs**.
