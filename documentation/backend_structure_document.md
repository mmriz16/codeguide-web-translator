# Backend Structure Document

This document outlines the backend architecture, database management, API design, hosting solutions, infrastructure components, security measures, monitoring, and maintenance strategies for the **codeguide-web-translator** project. It is written in everyday language so that anyone can understand how the backend is set up and why each part was chosen.

## 1. Backend Architecture

### Overview
The backend is built on Next.js 15 using the App Router. It follows a modular design, where each feature (like translation or authentication) lives in its own folder. This clean separation makes it easy to add, remove, or update features without breaking others.

### Design Patterns and Frameworks
- **Server-Side API Routes**: All sensitive operations—like calling the OpenAI API—happen in Next.js API routes or server actions to keep secrets off the client.
- **Modular File Structure**: Every API endpoint has its own folder under `/app/api/`, keeping file responsibilities clear.
- **ORM Layer**: Drizzle ORM provides a typed, programmatic way to interact with PostgreSQL, reducing manual SQL and runtime errors.
- **Authentication Module**: The `better-auth` package offers pre-built sign-up/sign-in flows and session management, which can be enabled or disabled as needed.

### Scalability, Maintainability, Performance
- **Scalability**: The App Router supports serverless deployments (e.g., Vercel), automatically scaling based on traffic. The database can be scaled independently (e.g., increasing RDS instance size). Rate limiting with Redis (Upstash) prevents abuse.
- **Maintainability**: Clear folder structure and TypeScript types across the stack make it easy for new developers to understand and modify code.
- **Performance**: Serverless functions start cold but are kept warm on Vercel. A CDN caches static assets. Redis handles quick lookups for rate limits.

## 2. Database Management

### Database Technologies
- **Type**: Relational (SQL)
- **System**: PostgreSQL
- **ORM**: Drizzle ORM (TypeScript-first)

### Data Storage and Access
- **Connection Pooling**: Managed by the cloud provider (e.g., AWS RDS or Supabase) to handle many simultaneous connections.
- **Query Patterns**: Simple CRUD for user and translation records, executed via Drizzle’s typed queries.
- **Migrations**: Handled through Drizzle’s migration tooling to apply schema changes safely.

### Data Management Practices
- **Backups**: Automated daily backups of the PostgreSQL instance.
- **Retention**: User and translation data retained indefinitely or per business rules, with archival policies if needed.
- **Indexes**: Placed on foreign keys and timestamp columns to speed up lookups.

## 3. Database Schema

### Human-Readable Schema
1. **Users**
   - Unique ID (UUID)
   - Email address
   - Hashed password
   - Timestamps: created_at, updated_at

2. **Translations**
   - Unique ID (UUID)
   - User ID (UUID, optional for anonymous) → links to Users
   - Source language code (e.g., "en")
   - Target language code (e.g., "es")
   - Original text (text)
   - Translated text (text)
   - Timestamps: created_at, updated_at

### SQL Schema (PostgreSQL)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  source_lang VARCHAR(10) NOT NULL,
  target_lang VARCHAR(10) NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_translations_user_id ON translations(user_id);
CREATE INDEX idx_translations_created_at ON translations(created_at);
```  

## 4. API Design and Endpoints

### API Style
- **RESTful**: JSON over HTTP
- **Endpoint Structure**: Placed under `/app/api/` in Next.js

### Key Endpoints
- **POST /api/translate**
  - Purpose: Receive text and language preferences, enforce rate limit, call OpenAI, return translated text.
  - Input: `{ originalText, sourceLang, targetLang }`
  - Output: `{ translatedText }`
  - Security: Validates API key server-side, checks rate limit in Redis.

- **GET /api/translations**
  - Purpose: Fetch a user’s past translations.
  - Input: Auth token (cookie or header)
  - Output: `[{ id, sourceLang, targetLang, originalText, translatedText, createdAt }]`

- **Auth Routes (via better-auth)**
  - POST /api/auth/signup
  - POST /api/auth/signin
  - GET /api/auth/session

### Frontend-Backend Communication
- **Fetch API**: Frontend uses `fetch` to call `/api/translate` and `/api/translations`.
- **Error Handling**: All errors return a consistent JSON shape `{ error: string, code?: number }`.

## 5. Hosting Solutions

### Cloud Providers
- **Next.js App (Frontend & API)**: Vercel (serverless functions + CDN)
- **PostgreSQL**: AWS RDS (or Supabase) for managed database with automated backups
- **Redis**: Upstash for serverless, pay-as-you-go Redis used in rate limiting

### Benefits
- **Reliability**: Vercel and AWS RDS offer high uptime SLAs.
- **Scalability**: Serverless functions on Vercel auto-scale with traffic; RDS can be scaled vertically.
- **Cost-Effectiveness**: Pay only for what you use with serverless and managed services.

## 6. Infrastructure Components

- **Load Balancer/CDN**: Vercel’s global edge network distributes static assets and routes API calls to the nearest region.
- **Caching/Rate Limiting**: Upstash Redis stores counters per user/IP to throttle translation requests.
- **Containerization**: Docker used locally for consistent development and CI pipelines.
- **Secrets Management**: Environment variables stored in Vercel and local `.env` for development.

## 7. Security Measures

- **Authentication**: `better-auth` with secure cookies and session tokens.
- **Authorization**: User-based access to `/api/translations`; anonymous users limited to translation endpoint with rate caps.
- **Encryption in Transit**: HTTPS everywhere (Vercel enforces TLS).
- **Encryption at Rest**: RDS storage encrypted by default.
- **Input Validation & Sanitization**: Server-side checks to prevent injection attacks.
- **Rate Limiting**: Prevents abuse of the OpenAI API and keeps costs in check.
- **Environment Variables**: API keys (including OpenAI) never exposed to the client.

## 8. Monitoring and Maintenance

### Monitoring Tools
- **Vercel Analytics**: Tracks request volumes, latency, and error rates.
- **Sentry (optional)**: Captures runtime exceptions in API routes.
- **Database Metrics**: AWS RDS dashboard for CPU, connections, and slow queries.
- **Redis Metrics**: Upstash provides usage and latency insights.

### Maintenance Strategies
- **CI/CD Pipeline**: GitHub Actions runs tests, linting, and builds Docker images before deployment.
- **Scheduled Backups**: Daily database backups with point-in-time recovery.
- **Dependency Updates**: Renovate or Dependabot to keep npm packages up to date.
- **Regular Audits**: Quarterly security reviews and performance tuning.

## 9. Conclusion and Overall Backend Summary

The backend for **codeguide-web-translator** combines the flexibility of Next.js serverless functions with a robust PostgreSQL database and Redis-powered rate limiting. Hosted on Vercel and managed database services, it scales automatically, stays cost-effective, and remains secure. With clear API designs, a human-readable database schema, and well-defined infrastructure components, this setup provides a solid, maintainable foundation for the translation application. Whether you’re adding user-specific features or streaming long-form translations, this architecture can grow with your needs while keeping performance and developer experience front and center.