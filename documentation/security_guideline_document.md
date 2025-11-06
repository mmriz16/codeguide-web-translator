# codeguide-web-translator Security Guidelines

## 1. Purpose and Scope
This document defines security best practices and controls tailored for the **codeguide-web-translator** boilerplate. It ensures that the translator feature—built on Next.js 15, TypeScript, Drizzle ORM, PostgreSQL, and the Vercel AI SDK—adheres to robust security principles throughout design, implementation, and deployment.

## 2. Core Security Principles
  - **Security by Design**: Embed security from the earliest design decisions through testing and release.  
  - **Least Privilege**: Grant only the minimum permissions to each component (API routes, database users, external services).  
  - **Defense in Depth**: Apply multiple overlapping controls (rate limiting, authentication, input validation).  
  - **Fail Securely**: On errors, return generic messages without leaking internal details or stack traces.  
  - **Secure Defaults**: Opt for the most restrictive configuration unless explicitly loosened.

## 3. Authentication & Access Control
  - **Endpoint Protection**:  
    • Use your existing `better-auth` flows or NextAuth to secure any translation history or dashboard endpoints.  
    • Ensure every sensitive API route (e.g., `/api/translate`, `/api/history`) verifies the user’s session/token server-side.  
  - **Session Management**:  
    • Generate high-entropy session IDs and store them in encrypted, `HttpOnly`, `Secure`, `SameSite=Strict` cookies.  
    • Enforce idle and absolute timeouts; provide a logout endpoint that invalidates the session.  
  - **Role-Based Access Control (RBAC)**:  
    • Define roles (e.g., `guest`, `user`, `admin`) and assign permissions for translation quotas, history viewing, or admin dashboards.  
    • Validate roles on each API request before executing any business logic.

## 4. Input Handling & Processing
  - **Prevent Injection**:  
    • Use Drizzle ORM’s parameterized queries for all database interactions.  
    • Never concatenate user input into SQL or shell commands.  
  - **Sanitize & Validate**:  
    • On `/api/translate`, validate request payloads (text length, source/target language codes against an allow-list).  
    • For `.txt` uploads, check MIME type, file size limits, and strip unsupported control characters before processing.  
  - **File Upload Security**:  
    • Store any uploaded files (if persisted) outside the public webroot or in a dedicated object store (e.g., AWS S3 with private ACLs).  
    • Scan uploads for malware when possible (e.g., via ClamAV).  
  - **Output Encoding**:  
    • When reflecting user-provided content in the UI, apply context-aware encoding to prevent XSS.  
    • Use React’s built-in escaping rather than `dangerouslySetInnerHTML` unless absolutely necessary and sanitized.

## 5. Data Protection & Privacy
  - **Secrets Management**:  
    • Store `OPENAI_API_KEY`, database credentials, and other secrets in environment variables or a secrets manager (Vault, AWS Secrets Manager).  
    • Never commit secrets to Git or expose them to the client bundle.  
  - **Encryption**:  
    • Enforce TLS 1.2+ on all endpoints (Next.js `redirect` to HTTPS).  
    • Encrypt sensitive data at rest in the database (e.g., user PII) using column-level encryption if required.  
  - **Data Minimization**:  
    • Return only necessary fields in API responses (avoid dumping full user or translation records).  
    • Purge or anonymize translation history older than a configured retention period to comply with privacy regulations.

## 6. API & Service Security
  - **Rate Limiting & Throttling**:  
    • Integrate Upstash/`@upstash/ratelimit` in `/app/api/translate/route.ts`.  
    • Enforce per-IP or per-user limits (e.g., 5 requests/minute) to prevent abuse and control OpenAI costs.  
  - **CORS Policy**:  
    • Configure Next.js `headers()` to allow only trusted origins (your frontend domain).  
    • Disallow wildcard (`*`) in production.  
  - **API Versioning**:  
    • Namespace translation routes under `/api/v1/translate` to allow safe evolution.  
  - **Correct HTTP Methods**:  
    • Use `POST` for `/api/translate`, `GET` for retrieving history, `DELETE` for clearing user data, etc.

## 7. Web Application Security Hygiene
  - **CSRF Protection**:  
    • For any state-changing POST/DELETE requests from the browser, implement CSRF tokens via NextAuth’s built-in mechanism or `csrf()` from `next-auth`.  
  - **Security Headers**:  
    • `Content-Security-Policy`: restrict scripts/styles to self and approved CDNs.  
    • `Strict-Transport-Security`: max-age=63072000; includeSubDomains; preload.  
    • `X-Content-Type-Options`: nosniff.  
    • `X-Frame-Options`: DENY or use `frame-ancestors` in CSP.  
    • `Referrer-Policy`: no-referrer-when-downgrade or strict-origin.
  - **Cookie Settings**:  
    • All session or refresh cookies set with `Secure`, `HttpOnly`, and `SameSite=Strict`.

## 8. Infrastructure & Configuration Management
  - **Docker Hardening**:  
    • Use minimal base images (e.g., `node:alpine`) and avoid running as `root`.  
    • Scan images for vulnerabilities (e.g., `docker scan`).  
  - **Environment Segregation**:  
    • Separate dev, staging, and production credentials and databases.  
    • Employ feature flags or environment-specific configs for sensitive features.  
  - **Dependency Updates**:  
    • Use lock files (`package-lock.json`) and automated tooling (Dependabot, Renovate) to track and apply security patches.  
    • Periodically run SCA tools (e.g., npm audit, Snyk) to catch known CVEs.

## 9. Testing & Monitoring
  - **Automated Tests**:  
    • Unit test input validation and file-parsing logic.  
    • Integration test the `/api/translate` endpoint, including rate-limit triggers and error paths.  
  - **Continuous Security Scans**:  
    • Integrate SAST (ESLint with security plugins) and SCA in your CI pipeline.  
    • Run dynamic tests (e.g., OWASP ZAP) against deployed staging environments.  
  - **Logging & Alerting**:  
    • Log authentication failures, rate-limit breaches, and OpenAI API errors to a centralized system (e.g., Datadog, Logstash).  
    • Monitor for anomalous patterns (spikes in failed translations or API errors).

## 10. Conclusion
By following these guidelines, the **codeguide-web-translator** boilerplate will remain secure, compliant, and resilient as you implement your OpenAI-powered translation features. Prioritize security in every pull request and continuously review and refine controls as your application evolves.