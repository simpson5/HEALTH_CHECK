# Repository Guidelines

## Project Structure & Module Organization
- Root-level Python files power the backend: `server.py` exposes the FastAPI API and file uploads, and `database.py` owns SQLite setup and JSON export helpers.
- The React client lives in `frontend/`. Main UI code is under `frontend/src/`, with pages in `frontend/src/pages/`, shared UI in `frontend/src/components/`, and API helpers in `frontend/src/lib/`.
- Persistent and user-generated data sits outside source code: `data/` for SQLite files, `photos/` for uploaded meal images, and `uploads/` for non-image files.
- Planning notes and product history are in `docs/`. Older static prototypes are kept in `archive/` and should not be updated unless you are intentionally reviving legacy assets.

## Build, Test, and Development Commands
- Backend dev server: `python3 -m uvicorn server:app --host 0.0.0.0 --port 18000 --reload`
- Frontend install: `cd frontend && npm install`
- Frontend dev server: `cd frontend && npm run dev`
- Frontend production build: `cd frontend && npm run build`
- Frontend lint: `cd frontend && npm run lint`
- Database backup: `./backup_db.sh`

## Coding Style & Naming Conventions
- Follow existing local style instead of reformatting unrelated files. Python code currently uses 4-space indentation and `snake_case`; React components use `PascalCase` filenames like `WorkoutSession.jsx`.
- Keep frontend modules small and colocate reusable UI under `frontend/src/components/` and page-specific logic under `frontend/src/pages/`.
- Use descriptive API and helper names such as `add_diet`, `toggle_favorite`, and `useData`.
- Run `npm run lint` in `frontend/` before handing off JSX changes. No repo-wide formatter is configured.

## Testing Guidelines
- There is no automated test suite checked in yet. For now, verify changes with focused manual checks.
- Backend changes should be exercised against local API routes such as `GET /api/data` and the affected POST/DELETE endpoints.
- Frontend changes should be checked in the Vite dev server and validated with `npm run build` for production safety.
- If you add tests, place frontend tests next to the feature or in `frontend/src/__tests__/` and use `*.test.jsx` naming.

## Commit & Pull Request Guidelines
- Match the concise commit style already used in history: prefixes such as `health:` and `fix:` followed by a short summary, for example `fix: split weight/fat chart axes`.
- Keep commits focused on one logical change. Separate data updates, UI work, and schema changes when possible.
- Pull requests should include: a short purpose statement, impacted areas (`server.py`, `database.py`, `frontend/src/...`), manual verification steps, and screenshots for visible UI changes.

## Data & Configuration Notes
- Treat `data/`, `photos/`, `uploads/`, and `simpson_data.json` as user data. Do not delete or bulk-edit them without explicit approval.
- Prefer additive schema changes in `database.py`, and keep API responses backward-compatible with the existing frontend.
