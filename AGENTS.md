# Repository Guidelines

## Project Structure & Module Organization
This repository is intended for a Chrome extension. Keep code and assets organized so contributors can find things quickly.
- `src/`: Extension source (content scripts, background/service worker, popup UI, shared utilities).
- `public/`: Static assets (icons, images) and `manifest.json`.
- `tests/`: Unit or integration tests for parsers, search builders, and UI components.
If these folders do not exist yet, create them as you add functionality.

## Build, Test, and Development Commands
No build system is configured yet. If you add tooling, provide npm scripts and keep them minimal. Expected commands:
- `npm install`: Install dependencies.
- `npm run dev`: Build/watch for local development.
- `npm run build`: Create a production build.
- `npm test`: Run tests.
For local manual testing, load the extension via `chrome://extensions` -> Load unpacked -> select the repo root or `public/`.

## Coding Style & Naming Conventions
- Indentation: 2 spaces for JS/TS, 2 spaces for JSON/HTML/CSS.
- File naming: `kebab-case` for files, `PascalCase` for React components (if used).
- Prefer small modules with single responsibilities (e.g., `parser-old-site.ts`, `parser-new-site.ts`).
- Avoid eval, remote code execution, and dynamic `Function` usage (Chrome extension policy).

## Testing Guidelines
Use a lightweight test runner (e.g., Vitest or Jest) once tests exist. Name tests by feature, e.g., `parser-old-site.test.ts`. Focus on:
- HTML parsing for old/new NTU course pages.
- Search query construction for Google with site targets.
- UI state transitions for teacher vs course mode.

## Commit & Pull Request Guidelines
No commit convention is established yet. Use Conventional Commits when possible, e.g., `feat: add new-site parser` or `fix: handle missing teacher name`.
PRs should include:
- A clear description of changes.
- Links to related issues (if any).
- Screenshots or GIFs for UI changes.

## Security & Configuration Tips
- Use `manifest_version: 3` and a service worker.
- Request only the permissions you need (principle of least privilege).
- Avoid injecting scripts into Google pages beyond what is necessary to open a new search tab.
