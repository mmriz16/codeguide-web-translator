# Frontend Guideline Document

This document describes the frontend setup for the **codeguide-web-translator** starter template. It covers the architecture, design principles, styling, components, state management, routing, performance optimizations, and testing strategies. Anyone reading this can understand how to work with and extend the frontend without needing a deep technical background.

---

## 1. Frontend Architecture

**Frameworks & Libraries**

- **Next.js 15 (App Router)**: Provides file-based routing, server & client components, API routes, and built-in performance optimizations.
- **TypeScript**: Adds type safety across the codebase, catching errors at compile time.
- **Tailwind CSS v4**: Utility-first CSS framework for rapid styling and consistent layouts.
- **shadcn/ui**: A library of pre-built React components (forms, buttons, headers, progress bars) styled with Tailwind.
- **Docker**: Ensures a consistent development environment through containerization.

**Scalability & Maintainability**

- **App Router & File Structure**: Each page, API route, and component lives in its own file under the `/app` or `/components` folder. This clear separation makes it easy to add or remove features.
- **Server vs. Client Components**: Next.js lets you decide where logic runs. Sensitive logic (like calling OpenAI) stays on the server, while interactive UI lives in client components.
- **TypeScript**: Strong typing reduces bugs and clarifies data structures across features.

**Performance**

- **Built-in Code Splitting**: Next.js automatically splits code per page, so users only download what they need.
- **Image & Asset Optimization**: Leverage `next/image` and built-in asset handling to serve optimized images and static files.
- **Server-Side Rendering & Caching**: Use SSR or static generation for speed and SEO.

---

## 2. Design Principles

**Key Principles**

1. **Usability**: Simple, intuitive interfaces. Clear labels, logical flow, and minimal clicks to complete a task.
2. **Accessibility**: Follow WCAG guidelines—semantic HTML, focus outlines, ARIA labels, and high contrast colors.
3. **Responsiveness**: Mobile-first design. UI adapts smoothly across phones, tablets, and desktops.
4. **Consistency**: Uniform look & feel across pages and components. Reuse the same buttons, inputs, and spacing rules.

**Applying These Principles**

- Use **semantic HTML** elements (e.g., `<button>`, `<nav>`, `<header>`) inside React components.
- Include **aria-label** or **role** attributes for interactive elements.
- Leverage Tailwind’s responsive utilities (e.g., `md:flex`, `lg:grid`) to adjust layouts at different breakpoints.
- Stick to a **design token** system (defined colors, font sizes, spacing) so everything follows the same measurement rules.

---

## 3. Styling and Theming

**Styling Approach**

- **Tailwind CSS v4**: Use utility classes for margins, padding, colors, and typography. No custom CSS files—styles come directly from class names.
- **No CSS Pre-processors**: Tailwind removes the need for SASS/LESS; custom logic goes into `tailwind.config.js`.

**Theming**

- **Dark/Light Mode**: Controlled by a `class` strategy (`.dark` on `<html>`). Tailwind’s `dark:` variants switch colors automatically.
- **Theme Configuration**: Extend Tailwind’s `theme` section with your custom colors in `tailwind.config.js`.

**Design Style**

- **Modern Flat Design**: Minimal shadows, clean edges, plenty of white space, and subtle color accents.

**Color Palette**

- **Primary**: #3B82F6 (blue)  
- **Secondary**: #6366F1 (indigo)  
- **Accent**: #10B981 (emerald)  
- **Background**: #F9FAFB (light), #111827 (dark)  
- **Surface/Card**: #FFFFFF (light), #1F2937 (dark)  
- **Text Primary**: #111827 (light), #F9FAFB (dark)  
- **Error**: #EF4444 (red)

**Font**

- **Inter**: A clean, legible sans-serif font. Include via Google Fonts or self-host in your layout’s `<head>`.

---

## 4. Component Structure

**Organization**

- `/components/ui/`: Houses all reusable UI primitives from shadcn (e.g., `<Button>`, `<Select>`, `<Textarea>`, `<Progress>`).
- `/components/common/` or `/components/**`: Place custom components like `<LanguageSelector>`, `<FileUploader>`, or `<DownloadButton>`.
- One component per file, named in **PascalCase** (e.g., `LanguageSelector.tsx`).

**Reusability**

- Break UIs into small, self-contained components.
- Pass data via **props** and handle events via **callback props**.
- Avoid duplicating markup—extract common patterns into shared components.

**Benefits**

- Easier to test and maintain.
- Clear ownership: Each component has a single responsibility.
- Better collaboration: Designers and developers can work on isolated pieces.

---

## 5. State Management

**Local State**

- Use React’s `useState`, `useEffect` for component-level data (e.g., the contents of the text input or selected language).

**Shared/Global State**

- For very simple needs (theme toggle, user session), use React’s **Context API**.
- For data fetching and caching, consider **SWR** or **React Query** (not included by default, but easy to adopt).

**Server State**

- Next.js handles data fetching with **server components** or **API routes**. Fetch translation results via `fetch('/api/translate')` and update client state accordingly.

---

## 6. Routing and Navigation

**Next.js App Router**

- All pages live under `/app`. For example:
  - `/app/page.tsx` → Home
  - `/app/translator/page.tsx` → Translator UI
  - `/app/dashboard/page.tsx` → Protected dashboard
- API routes live under `/app/api`. For example:
  - `/app/api/translate/route.ts` → Translation endpoint

**Navigation**

- Use Next.js’s `<Link>` component for client-side transitions.
- Access router utilities via `useRouter()` for programmatic navigation (e.g., redirect after login).

---

## 7. Performance Optimization

1. **Lazy Loading & Code Splitting**: Next.js splits each route into its own bundle. For large components, use `dynamic()` to load them only when needed.
2. **Image Optimization**: Use `next/image` to automatically serve WebP or JPG based on the user’s browser.
3. **Caching & Revalidation**: Employ Next.js `revalidate` option for ISR (incremental static regeneration) or HTTP caching headers in API routes.
4. **Streaming & Suspense**: For long translations, use the Vercel AI SDK or OpenAI streaming API to render partial results in real time, improving perceived speed.
5. **Bundle Analysis**: Run `next build && next analyze` to spot large dependencies and remove or replace them.

---

## 8. Testing and Quality Assurance

**Unit Tests**

- **Jest** + **React Testing Library** for component logic and rendering.
- Example: Test the `<LanguageSelector>` renders options, fires callbacks, and handles invalid props.

**Integration Tests**

- Test your `/api/translate/route.ts` with **Supertest** or **MSW** (Mock Service Worker) to simulate OpenAI responses and rate-limit scenarios.

**End-to-End (E2E)**

- **Cypress** or **Playwright** to run browser tests: fill text, choose languages, click “Translate,” and verify output appears.

**Linting & Formatting**

- **ESLint** with recommended configs (Next.js, TypeScript, React).  
- **Prettier** for consistent code style.  
- **Husky** + **lint-staged** to run checks before each commit.

**CI/CD**

- Integrate tests and linting into GitHub Actions (or your CI of choice) to block merges on failure.

---

## 9. Conclusion and Overall Frontend Summary

This frontend guideline document has outlined how the **codeguide-web-translator** uses a modern, scalable architecture built on Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui. It emphasizes clear design principles—usability, accessibility, responsiveness—and a modular component structure that ensures maintainability. State management stays lightweight with React hooks and Context, while Next.js file-based routing and API routes keep frontend and backend concerns cleanly separated.

Performance is baked in via automatic code splitting, image optimization, and streaming capabilities. A solid testing strategy (unit, integration, E2E) and code-quality tools (ESLint, Prettier, CI pipelines) guarantee reliability and fast development cycles.

By following these guidelines, you can confidently extend the translator UI, implement secure backend logic, and deliver a polished, user-friendly application that aligns with best practices in modern frontend development.