# Meridian Electronics Chatbot

Monorepo with a **FastAPI** backend (`apps/api`) and a **Next.js** frontend (`apps/web`). The production FastAPI instance is **not** deployed on Vercel; deploy the API separately (e.g. Render per `apps/api/RENDER.md`) and set **`NEXT_PUBLIC_API_URL`** on the frontend to the **public HTTPS URL** of that API.

Copy `apps/api/.env.example` → `apps/api/.env`, and `apps/web/.env.example` → `apps/web/.env.local`, then fill in secrets locally.
