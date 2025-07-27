# The Developer's Pact: Our Rules of Engagement

_This document outlines the core principles and conventions we will follow in this project. As my AI partner, your adherence to these rules is critical for building high-quality, maintainable software._

### 🏛️ Principle 1: Architecture & Structure

- **Modularity is Key:** No single file should exceed 500 lines. If it grows too large, your first step is to propose a refactoring plan to split it across domain-driven components (e.g., separate Commands, Handlers, Services, Validators).

- **Consistent Organization:** We follow Clean Architecture and DDD. Group by feature across these layers:

  - `Domain/Feature/` — business entities, enums, and value objects.
  - `Application/Feature/` — CQRS commands, queries, handlers, and DTOs.
  - `Infrastructure/` — service implementations, database contexts, and third-party integrations.
  - `API/Controllers/` — user-facing endpoints and mappings.
  - `Tests/` — organized by project and feature with clear naming.

- **Clean Dependencies:** Avoid circular references. Dependencies flow inward only (API → Application → Domain). Use interfaces to decouple implementations.

- **Configuration Discipline:** All secrets, API URLs, or environment-specific settings must be stored in `appsettings.{Environment}.json` or managed via `IConfiguration`. Never hardcode values.

### ✅ Principle 2: Quality & Reliability

- **Test Everything That Matters:** Every new service, handler, or controller action must have unit tests. Complex features should include integration tests.

- **The Test Triad:** For each feature, write:

  1. A "happy path" test for expected behavior.

  2. An "edge case" test for uncommon but valid inputs.

  3. A "failure case" test for expected exceptions or validation errors.

- **XML Comments are Required:** All public methods and classes must have XML documentation (`/// <summary>`, `/// <param>`, etc.). This ensures IntelliSense and documentation clarity.

### ✍️ Principle 3: Code & Style

- **Follow the Standards:** Use `.editorconfig` with StyleCop, and format code using `dotnet format`. Stick to C# coding conventions (PascalCase for public members, camelCase for private).

- **Type Safety:** Always use strong typing. Avoid `dynamic` unless absolutely necessary. Prefer `record` types or immutable models where applicable.

- **Data Validation:** Use `FluentValidation` for validating requests in the Application layer. This ensures a centralized and testable validation strategy.

### 🧠 Principle 4: Your Behavior as an AI

- **Clarify, Don't Assume:** If a requirement is ambiguous or context is missing, your first action is to ask for clarification.

- **No Hallucinations:** Do not invent libraries, interfaces, or file paths. If a tool or package is needed, explain what and why before using it.

- **Plan Before You Code:** For any non-trivial feature, first outline an implementation plan or architecture sketch (class structure, DI registration, flow). We'll approve this before final implementation.

- **Explain the "Why":** For complex logic, add `// WHY:` comments explaining the design rationale or tradeoffs (e.g., why a retry policy or a specific LINQ query was used).
