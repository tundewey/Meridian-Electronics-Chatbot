# Meridian Electronics Chatbot

Monorepo with a **FastAPI** backend (`apps/api`) and a **Next.js** frontend (`apps/web`). The API is **not** deployed on Vercel; deploy it separately (e.g. **Render** — see `apps/api/RENDER.md`), then point the web app at it.

### Deploy

| Part | Where | Notes |
|------|--------|--------|
| **API** | Render (or similar) | Dockerized FastAPI in `apps/api/` |
| **Web** | **Vercel** | See **`apps/web/VERCEL.md`** — Root Directory **`apps/web`**, set **`API_URL`** = your public FastAPI HTTPS URL (server proxy at `/api/chat` avoids browser CORS) |

Copy `apps/api/.env.example` → `apps/api/.env`, and `apps/web/.env.example` → `apps/web/.env.local`, then fill in secrets locally. On Render/Vercel, set the same logical vars in each dashboard (never commit real keys).
