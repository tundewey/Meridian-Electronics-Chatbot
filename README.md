# Meridian Electronics Chatbot

Monorepo with a **FastAPI** backend (`apps/api`) and a **Next.js** frontend (`apps/web`). The API is **not** deployed on Vercel; deploy it separately (e.g. **Render** — see `apps/api/RENDER.md`), then point the web app at it.

### Deploy

| Part | Where | Notes |
|------|--------|--------|
| **API** | Render (or similar) | Dockerized FastAPI in `apps/api/` |
| **Web** | **Vercel** | See **`apps/web/VERCEL.md`** — set project **Root Directory** to **`apps/web`** and add **`NEXT_PUBLIC_API_URL`** = your public API HTTPS URL |

Copy `apps/api/.env.example` → `apps/api/.env`, and `apps/web/.env.example` → `apps/web/.env.local`, then fill in secrets locally. On Render/Vercel, set the same logical vars in each dashboard (never commit real keys).
