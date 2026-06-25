# ZLinkFE

The admin dashboard for the [ZLink](../ZLink) URL shortener.

**ZLinkFE** is a single-page Angular + Angular Material application for managing
short links, users, API keys, and the cache. It talks to the ZLink REST API
over JWT and is fully decoupled — build it once and point it at any ZLink
backend.

> Short-link **redirects** are handled by the Go service
> ([ZLinkClient](../ZLinkClient)); this app only talks to the management API
> ([ZLink](../ZLink)).

## Features

- 🔗 Link management — create, edit, search, copy, delete
- 🔑 API keys — create with optional expiry, one-time secret reveal, revoke/delete
- 👥 User management with role-aware controls (superuser only)
- 👤 Self-service profile & password change
- ⚡ Redis cache inspection and clearing (superuser only)
- 🌗 Light/dark theme toggle
- ⚙️ **Runtime-configurable API endpoint** — no rebuild needed to change backends

## Tech stack

Angular 20 (standalone components, lazy-loaded routes) · Angular Material ·
JWT auth with an HTTP interceptor that auto-refreshes tokens

## Quick start

```bash
cd ZLinkFE
npm install
npm start                 # ng serve on http://localhost:4200
```

Run the ZLink API (default `http://localhost:8000`) and set
`CORS_ALLOWED_ORIGINS=http://localhost:4200` in its `.env`.

## Configuring the API endpoint

The endpoint is resolved at **runtime**, so a single build can target any
backend. Resolution order on startup:

1. A URL the user entered in the in-app **setup screen** (saved to `localStorage`)
2. `apiBase` from `public/config.json`, generated from the `API_BASE` env var
3. If neither is set, the app prompts for the endpoint on first load

```bash
cp .env.template .env
# API_BASE=https://api.example.com/api   # or /api for same-domain, or leave empty
```

`API_BASE` is baked into `config.json` by `scripts/generate-config.mjs`, which
runs automatically before `npm start` and `npm run build`.

## Build

```bash
npm run build             # outputs to dist/ZLinkFE/browser
```

A `vercel.json` is included with an SPA rewrite (all routes → `index.html`).

## Pages

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login | public |
| `/setup` | API endpoint setup | public |
| `/links` | Link management | staff |
| `/settings/api-keys` | API keys | staff |
| `/settings/profile` | Profile & password | any user |
| `/settings/users` | User management | superuser |
| `/settings/cache` | Redis cache | superuser |

## License

MIT — part of the ZLink project.
