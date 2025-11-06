# Project Requirements Document (PRD)

## 1. Project Overview

This project, built on the `codeguide-web-translator` starter template, delivers a ready-to-use web application for translating text (or `.txt` files) between languages using OpenAI’s GPT-4.1-mini model. It provides a clean, modern interface—leveraging Next.js 15, TypeScript, Tailwind CSS, and `shadcn/ui` components—so you can focus on translation logic rather than setup. A secure server-side API route handles requests, applies rate limiting, and invokes the OpenAI API with an environment-hidden key.

The main goals are speed, simplicity, and security. Success means users can visit the translator page, choose source/target languages, enter or upload text, hit "Translate," see a progress indicator, and receive correct translations within seconds. A built-in download feature lets them save results as a `.txt` file. By avoiding additional complexity (like user accounts or history), the first version remains lean and production-ready.

## 2. In-Scope vs. Out-of-Scope

**In-Scope (v1.0):**
- Public translator page (`/app/translator/page.tsx`) with text area and file upload for `.txt` files.
- Two dropdowns for source and target language selection.
- "Translate" button that triggers a fetch to `/app/api/translate/route.ts`.
- Server-side translation logic: receive input, call OpenAI GPT-4.1-mini, return translated text.
- Rate limiting using `upstash/ratelimit` (Redis) to prevent abuse.
- Progress indicator (`<Progress>`) during translation.
- "Download Result" button to save translation as `.txt` via a client-side Blob.
- Dark/light mode support via existing theming.
- Basic error handling for API failures or invalid input.

**Out-of-Scope (v1.0):**
- User authentication or protected dashboard features.
- Persistence of translation history or analytics in the database.
- Premium plans, per-user quotas, or billing.
- Streaming translations or real-time word-by-word updates.
- Multi-format file support beyond plain `.txt`.

## 3. User Flow

A first-time visitor lands on the public translator page. They see a header with theme toggle, a large text area labeled "Enter text or upload a file," two dropdowns labeled "From" and "To" (showing supported languages), and two buttons: "Translate" and "Download Result" (disabled initially). If they choose, they can drag/drop or click to upload a `.txt` file, which populates the text area automatically.

When they click "Translate," the app shows a spinner or progress bar. In the background, the client sends a POST request to `/api/translate` with the text and language codes. The server checks the rate limit, calls the OpenAI API, and streams or returns the translated text. Once received, the progress indicator disappears, the translated text appears in the output area, and the "Download Result" button becomes active. Clicking that button triggers a file download of the translated content.

## 4. Core Features

- **Translator UI**: Text area + file-upload input for `.txt` files.
- **Language Selectors**: Two `<Select>` components for source and target languages.
- **Translate Button**: Triggers client-to-server request.
- **Progress Indicator**: A `<Progress>` bar or spinner during server processing.
- **Translation API Route**: `/app/api/translate/route.ts` handles requests, rate limiting, and OpenAI calls.
- **Rate Limiting**: `upstash/ratelimit` with Redis to throttle requests per IP/API key.
- **Download Feature**: Client-side Blob generation and download link for `.txt` files.
- **Error Handling**: Display user-friendly messages for network, rate-limit, or API errors.
- **Theming**: Dark and light mode controlled via existing theme hooks.

## 5. Tech Stack & Tools

- **Frontend Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: `shadcn/ui` (Textarea, Select, Button, Progress)
- **Backend & API**: Next.js API Routes
- **AI Integration**: OpenAI SDK (`gpt-4.1-mini` model)
- **Rate Limiting**: `@upstash/ratelimit` + Upstash Redis
- **ORM & Database**: Drizzle ORM + PostgreSQL (available for future use)
- **Authentication**: `better-auth` (not enabled in v1)
- **Containerization**: Docker (for local/dev environment)
- **IDE/Plugins**: VSCode, optional integrations like Cursor or Windsurf

## 6. Non-Functional Requirements

- **Performance**: Page load under 300 ms; translation turnaround under 2 s for texts up to 5000 characters.
- **Security**: Never expose `OPENAI_API_KEY` to client; sanitize user inputs; enforce HTTPS.
- **Scalability**: Rate limiter set to 5 requests per minute per IP (tunable).
- **Usability**: Responsive UI on desktop/mobile; clear error messages; keyboard-accessible controls.
- **Reliability**: API uptime ≥ 99.5%; graceful retry on transient network errors.
- **Maintainability**: Code linted via ESLint; type-checked with TypeScript.

## 7. Constraints & Assumptions

- **GPT-4.1-mini** availability and latency bound by OpenAI’s service.
- **Upstash Redis** instance must be provisioned for rate limiting.
- **Environment**: Node.js ≥ 18, Yarn/Pnpm, Docker for local replication.
- **File Size**: `.txt` uploads capped at 2 MB on client side.
- **Language List**: A predefined static array of supported language codes.
- **Browser Support**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge).

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits**: OpenAI may throttle; implement exponential backoff or user messaging on 429 responses.
- **Large File Handling**: Reading big files on the client can freeze UI; consider chunking or size checks.
- **Content Moderation Flags**: OpenAI may reject certain inputs; display clear guidance if flagged.
- **CORS & Networking**: Ensure correct headers on API route; test on Vercel/Netlify if deployed there.
- **Streaming Implementation**: If adopted later, streaming responses require additional client logic to append chunks.

Mitigation ideas: centralize error-handling logic, set reasonable input limits, and include feature flags to toggle advanced capabilities (like streaming) without redeploying core.

---

**This PRD provides a clear, unambiguous reference for all subsequent technical documents and code implementations.**