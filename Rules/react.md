# The Developer's Pact: Our Rules of Engagement (React Edition)

_This document outlines the core principles and conventions we will follow in this project. As my AI partner, your adherence to these rules is critical for building high-quality, maintainable software._

---

### 🏛️ Principle 1: Architecture & Structure

- **Feature-Driven Design:** Organize code by feature, not type. A new feature should live in its own directory with components, hooks, tests, types, and styles co-located (e.g., `src/components/dashboard/`).

- **Atomic Reusability:** Keep component sizes manageable. Any file >300 lines should trigger a modular split. Prefer smaller, testable components and hooks.

- **Modular Imports:** Use absolute imports via `tsconfig.json` paths (e.g., `@/components/...`) instead of relative ones like `../../../`.

- **Environment Management:** All API keys, endpoints, and config flags must be in `.env` files and accessed via `import.meta.env.VITE_...`. Never hardcode configuration or secrets.

---

### ✅ Principle 2: Quality & Reliability

- **Test-Driven Development:** Every new component, hook, or business logic must have accompanying tests in the same directory (`*.test.tsx` or `*.test.ts`).

- **Test Triad per Feature:**

  1. A happy path test — “It works under normal conditions.”

  2. An edge case test — “It behaves correctly in odd but valid scenarios.”

  3. A failure case — “It fails gracefully with bad input or errors.”

- **Test Types:**

  - **Unit tests** for components, utilities, hooks.
  - **Integration tests** with tools like Cypress for complete user flows.

- **Snapshot & Accessibility Testing:** Run `jest-axe` and visual regressions where applicable. Every component must pass basic a11y rules.

---

### ✍️ Principle 3: Code & Style

- **TypeScript-First:** All components, hooks, and functions must use TypeScript. Avoid `any` unless absolutely justified.

- **Formatting:** All code must be formatted with `prettier`. Run `eslint` and `tsc` before any PR. Commits should never include lint errors.

- **Component Style:**

  - Use `React.FC<Props>` for components.
  - Prefer `useMemo`, `useCallback`, and `React.memo` for performance optimizations.
  - Use `shadcn/ui`, Tailwind CSS, or styled modules for consistent design.

- **Data Shape Consistency:** Define types in `*.types.ts` and use them across hooks, props, and services. Reuse types rather than redefining.

---

### 🧠 Principle 4: Your Behavior as an AI

- **Ask First, Code Second:** If any requirement is unclear, you must ask for clarification before assuming.

- **No Fabrication:** Never invent a hook, file, or package. Only use tools explicitly mentioned or approved in the repo. If something is missing, propose its addition first.

- **Plan Before You Code:** For anything non-trivial, present a breakdown of components, data flow, and hooks you plan to build. We'll approve the direction before writing final code.

- **Explain the Why:** Use `// WHY:` comments for any unconventional or complex logic. Show your reasoning clearly to reduce onboarding friction.

---

### 🧪 Tooling Stack (Enforced by Convention)

| Category         | Tool                         |
| ---------------- | ---------------------------- |
| Language         | TypeScript                   |
| Framework        | React (18+)                  |
| State Mgmt       | Context + Hooks              |
| Styling          | Tailwind CSS / CSS Modules   |
| Forms            | React Hook Form              |
| Testing (unit)   | Jest + React Testing Library |
| Testing (e2e)    | Cypress                      |
| Linting          | ESLint                       |
| Formatting       | Prettier                     |
| Accessibility    | jest-axe, axe-core           |
| Docs / Storybook | Optional per component       |
