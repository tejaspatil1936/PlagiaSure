# PlagiaSure

A SaaS platform for schools and universities to detect plagiarism and AI-generated content in student assignments.

## Overview

PlagiaSure lets teachers upload student assignments (PDF, DOCX, or TXT), automatically extracts the text, and runs it through combined AI-content detection and plagiarism detection. The result is a report with an AI-probability score, a plagiarism score, and sentence-level highlighting showing which parts of the submission were flagged and why.

The project is split into two independent applications:

- **`backend/`** — a Node.js/Express REST API handling authentication, file storage, text extraction, AI/plagiarism detection, subscriptions, and payments.
- **`frontend/`** — a React (Vite) single-page application providing the teacher-facing dashboard and public marketing pages.

Authentication, the Postgres database, and file storage are all provided by Supabase.

## Features

- **Assignment upload & text extraction** — PDF (`pdf-parse`), DOCX/DOC (`mammoth`), and plain text files are parsed into raw text for analysis (`backend/utils/textExtractor.js`).
- **AI-content detection** — combines a Hugging Face inference model with a Google Gemini analysis pass, weighting the two scores (60/40) into a single AI-probability figure with per-sentence highlights (`backend/services/aiDetection.js`).
- **Plagiarism detection without a paid API** — instead of a commercial plagiarism API, the backend searches DuckDuckGo, Semantic Scholar, CrossRef, and arXiv (plus Wikipedia, GitHub, and pattern-based checks) to find matching text and produce a similarity score (`backend/services/freePlagiarismAPIs.js`, `trulyFreePlagiarism.js`, `plagiarismDetection.js`).
- **Reports** — each report stores the AI probability, plagiarism score, highlighted sentence arrays, and a text verdict, and can be regenerated (rechecked) on demand.
- **Authentication** — email/password and Google OAuth sign-in via Supabase Auth, with a bearer-token-protected API (`backend/middleware/auth.js`).
- **Subscription plans with enforced usage limits** — Free (2 lifetime scans), Basic, and Pro tiers (monthly/yearly), checked server-side before every scan (`backend/services/usageService.js`, `backend/routes/billing.js`).
- **Two billing paths** — a manual, admin-approved subscription-request workflow, and live online payments through Razorpay with HMAC signature verification (`backend/services/razorpayService.js`).
- **PDF invoice generation** — invoices for completed payments are generated server-side with `pdfkit` (`backend/routes/payments.js`).
- **Contact form** — public contact submissions are stored in the database with an admin-facing stats endpoint (`backend/routes/contact.js`).
- **Marketing & policy pages** — landing, pricing, about, contact, privacy policy, terms, refund, and shipping pages, all served from the same React app.

## Tech Stack

**Frontend**
- React 19 with Vite 7
- React Router 7
- TanStack Query for data fetching/caching
- Tailwind CSS 4
- Axios, jsPDF, lucide-react icons

**Backend**
- Node.js with Express 4
- Helmet (security headers) and express-rate-limit
- Multer for multipart file uploads
- `mammoth` and `pdf-parse` for document text extraction

**Database & Storage**
- Supabase (Postgres) with Row Level Security policies (`backend/database/schema.sql`, `backend/scripts/*.sql`)
- Supabase Storage for uploaded assignment files

**AI/ML**
- Google Gemini (`@google/generative-ai`, `@google/genai`)
- Hugging Face Inference API (`@huggingface/inference`)

**Other**
- Razorpay for payment processing
- Vercel (SPA rewrite config present at the repo root and in `frontend/`)

## Architecture

```
React frontend (Vite)
   |  file upload / API calls (axios + bearer token)
   v
Express backend
   - auth middleware (Supabase token verification)
   - routes: auth, assignments, reports, billing, payments, contact
   - services: aiDetection, plagiarismDetection, usageService, razorpayService
   |
   +--> Supabase (Postgres: users, subscriptions, assignments, reports,
   |                payments, user_usage, contact_submissions)
   +--> Supabase Storage (uploaded assignment files)
   +--> Google Gemini API + Hugging Face Inference API (AI detection)
   +--> DuckDuckGo / Semantic Scholar / CrossRef / arXiv (plagiarism search)
   +--> Razorpay (order creation, payment verification, webhooks)
```

Requests are authenticated with a Supabase-issued bearer token, verified in `authenticateUser` middleware. Usage-limited routes (`assignments/upload`, `reports/generate`) additionally pass through `checkUsageLimit`, which checks the caller's active subscription and remaining scan quota before the request proceeds.

## Project Structure

```
PlagiaSure/
├── backend/
│   ├── server.js                  # Express app entry point, CORS/helmet/rate-limit setup
│   ├── routes/
│   │   ├── auth.js                # signup, login, get user, logout
│   │   ├── assignments.js         # upload, fetch, re-extract, delete assignments
│   │   ├── reports.js             # generate/fetch AI + plagiarism reports
│   │   ├── billing.js             # plans, subscription requests, admin approval
│   │   ├── payments.js            # Razorpay orders, verification, invoices
│   │   └── contact.js             # public contact form + admin stats
│   ├── services/
│   │   ├── aiDetection.js         # Gemini + Hugging Face AI detection
│   │   ├── plagiarismDetection.js # orchestrates plagiarism strategies
│   │   ├── freePlagiarismAPIs.js  # DuckDuckGo/Semantic Scholar/CrossRef/arXiv
│   │   ├── trulyFreePlagiarism.js # additional free-source matching
│   │   ├── razorpayService.js     # order creation + signature verification
│   │   └── usageService.js        # subscription & usage-limit calculations
│   ├── middleware/auth.js         # token auth, subscription/admin/usage guards
│   ├── utils/textExtractor.js     # PDF/DOCX/TXT text extraction
│   ├── database/schema.sql        # core table definitions
│   └── scripts/                  # setup, payment, and contact schema SQL + test scripts
└── frontend/
    └── src/
        ├── pages/                 # Landing, Login, Signup, Dashboard, Assignments,
        │                          # Reports, Subscription, Pricing, About, Contact,
        │                          # policies/ (Privacy, Terms, Refund, Shipping, Contact)
        ├── components/
        │   ├── FileUpload/        # drag-and-drop upload modal
        │   ├── Payment/           # Razorpay payment modal, success/failure pages
        │   ├── Subscription/      # subscription dashboard
        │   └── Usage/             # usage limit modal/notifications
        ├── contexts/AuthContext.jsx
        ├── services/api.js        # axios client + auth token handling
        └── services/pdfService.js # client-side PDF export
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (Postgres + Storage + Auth)
- A Google Gemini API key
- A Razorpay account (only required for online payments)

### Environment variables

**`backend/.env`** (see `backend/.env.example`)

| Variable | Purpose |
|---|---|
| `PORT` | Backend port (default 5001) |
| `NODE_ENV` | `development` / `production` |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase project credentials |
| `SUPABASE_BUCKET_NAME` | Storage bucket for uploaded files |
| `GEMINI_API_KEY` | Google Gemini API key |
| `HUGGINGFACE_API_KEY` | Hugging Face Inference API key |
| `FRONTEND_URL` | Base URL used to generate payment redirect URLs |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Razorpay payment credentials |
| `PAYMENT_CURRENCY` | Currency code for payments (default `INR`) |

**`frontend/.env`** (see `frontend/.env.example`)

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend base URL |
| `VITE_APP_NAME`, `VITE_APP_VERSION` | Displayed app metadata |
| `VITE_SUPABASE_URL` | Supabase project URL |

### Run locally

```bash
# Backend
cd backend
npm install
npm run dev        # starts on http://localhost:5001 (nodemon)

# Frontend (separate terminal)
cd frontend
npm install
npm run dev         # Vite dev server, default http://localhost:5173
```

Before the API responds correctly, run the SQL in `backend/scripts/setup-database.sql` (and, if using payments/contact features, `create-payment-schema.sql` / `create-contact-schema.sql`) against the Supabase project's SQL editor, and apply the storage policies in `backend/scripts/setup-storage-policies.sql`.

### Build

```bash
cd frontend
npm run build        # production build via Vite
```

The backend has no build step; `npm start` runs `server.js` directly with Node.

## Usage

1. A teacher signs up or logs in (email/password or Google).
2. They upload a student assignment file; the backend extracts its text and stores it via `assignments.upload`.
3. Requesting a report (`reports/generate`) runs AI detection and plagiarism detection in parallel and stores the combined result.
4. The dashboard displays the AI probability, plagiarism score, and highlighted sentences, with an option to export the report.
5. Free-tier accounts are limited to 2 lifetime scans; further use requires a Basic or Pro subscription, activated either through manual admin approval or a completed Razorpay payment.

## API Documentation

All routes are mounted under `/api` in `backend/server.js`. Routes marked "Auth" require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Register a new user |
| POST | `/api/auth/login` | — | Log in and receive a session token |
| GET | `/api/auth/user` | Yes | Get the current authenticated user |
| POST | `/api/auth/logout` | Yes | Log out |
| POST | `/api/assignments/upload` | Yes | Upload an assignment file (checks usage limit) |
| GET | `/api/assignments` | Yes | List the current user's assignments |
| GET | `/api/assignments/:id` | Yes | Get a single assignment |
| POST | `/api/assignments/:id/reextract` | Yes | Re-run text extraction on a stored file |
| DELETE | `/api/assignments/:id` | Yes | Delete an assignment |
| POST | `/api/reports/generate` | Yes | Run AI + plagiarism detection for an assignment |
| GET | `/api/reports/:id` | Yes | Get a single report |
| GET | `/api/reports` | Yes | List the current user's reports |
| GET | `/api/billing/plans` | — | List available subscription plans |
| POST | `/api/billing/request-subscription` | Yes | Request a subscription (manual approval flow) |
| GET | `/api/billing/status` | Yes | Get current subscription status |
| POST | `/api/billing/cancel-request` / `/cancel-subscription` | Yes | Cancel a pending request or active subscription |
| GET | `/api/billing/payment-history` | Yes | List past payments |
| POST | `/api/billing/change-plan` | Yes | Switch subscription plan |
| GET | `/api/billing/admin/requests` | Yes (admin) | List pending subscription requests |
| POST | `/api/billing/admin/approve/:id` / `/reject/:id` | Yes (admin) | Approve or reject a subscription request |
| POST | `/api/payments/create-order` | Yes | Create a Razorpay order |
| POST | `/api/payments/verify-payment` | Yes | Verify a Razorpay payment signature |
| GET | `/api/payments/config` | — | Get payment configuration and redirect URLs |
| GET | `/api/payments/status/:orderId` | Yes | Get the status of an order |
| GET | `/api/payments/invoice/:paymentId` | Yes | Get an invoice PDF for a completed payment |
| POST | `/api/contact` | — | Submit a contact form |
| GET | `/api/contact` | — | List contact submissions |
| PATCH | `/api/contact/:id` | — | Update a contact submission's status |
| GET | `/api/contact/stats` | — | Contact submission statistics |
| GET | `/health` | — | Health check |

## Design Decisions

- **Free-source plagiarism detection instead of a paid API.** Rather than integrating a commercial service, `freePlagiarismAPIs.js` and `trulyFreePlagiarism.js` query DuckDuckGo, Semantic Scholar, CrossRef, and arXiv directly and score matches heuristically, avoiding recurring per-check API costs.
- **Weighted dual-model AI detection.** `aiDetection.js` runs a Hugging Face model and a Gemini analysis pass concurrently with `Promise.allSettled` and combines them with a 60/40 weighting, so a single provider outage degrades rather than breaks detection.
- **Two parallel billing paths.** `billing.js` implements a manual, admin-approved subscription workflow independent of `payments.js`'s live Razorpay integration, letting the product operate with or without real payment processing configured.
- **Lazy client initialization.** Gemini, Hugging Face, and Razorpay clients are only constructed on first use and only if their API key is present and not a placeholder value, so the server starts cleanly even with partial configuration.
- **Environment-driven payment redirect URLs.** Payment success/cancel/failure URLs are derived from `FRONTEND_URL` at request time (`GET /api/payments/config`) instead of being hardcoded, so the same backend build works across local, staging, and production environments (see `PAYMENT_URLS.md`).

## Future Improvements

- Build a frontend admin dashboard UI — the backend already exposes admin endpoints (`/api/billing/admin/*`) but the corresponding `Admin` page route is commented out in `frontend/src/App.jsx`.
- Add email notifications when a report finishes processing or a subscription request is approved/rejected.
- Extend usage analytics beyond the current lifetime/monthly scan counters in `usageService.js`.

## License

`backend/package.json` declares an ISC license for the backend package. No LICENSE file is currently included in the repository.
