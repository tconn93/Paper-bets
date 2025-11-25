# AGENTS.md

## Build, Lint, Test Commands

### Backend (from /backend)
- `npm run dev`: Start development server with nodemon
- `npm start`: Production server
- `npm run migrate`: Run database migrations
- `npm run lint`: ESLint check (requires .eslintrc.js setup)
- `npm run format`: Prettier format JS files
- No build step: `npm run build` echoes message
- Tests: None configured. Add Jest/Mocha if needed.
- Single test: N/A (no tests)

### Frontend (from /frontend)
- `npm run dev`: Vite dev server (localhost:3000)
- `npm run build`: Production build
- `npm run preview`: Preview build
- Lint: No script. Install ESLint and run `npx eslint src`
- Tests: None. Add Vitest/Jest.
- Single test: N/A

## Code Style Guidelines

- Language: JavaScript (migrated from TypeScript; no types)
- Imports: ES modules (`import`/`export`). Relative paths for local files.
- Formatting: Prettier (backend). 2-space indent, single quotes.
- Naming: camelCase for variables/functions, PascalCase for classes/components.
- Error Handling: Use `AppError` class in backend. Try-catch in async functions.
- Conventions: Follow Express/React patterns. No comments unless requested.
- Security: Never log secrets. Validate inputs with express-validator.
- No Cursor/Copilot rules found.