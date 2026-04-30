# Deploy API on Render

1. Push this repo to GitHub (or GitLab).
2. In [Render](https://dashboard.render.com): **New → Blueprint** → pick the repo → Render reads `render.yaml` from the root.
3. For each env var marked **sync: false**, open the web service → **Environment** and set:
   - `MCP_SERVER_URL` — Meridian MCP URL  
   - `OPENROUTER_API_KEY` — secret  
   - `CORS_ORIGINS` — e.g. `https://your-app.vercel.app` (comma-separated if multiple)

**Manual Web Service (no Blueprint):**

- **New → Web Service** → connect repo  
- **Root Directory:** `apps/api`  
- **Environment:** Docker  
- **Dockerfile path:** `Dockerfile` (relative to root directory = `apps/api/Dockerfile`)  
- Add the same env vars as in `.env.example`

**Check:** open `https://<your-service>.onrender.com/health` — expect `{"status":"ok"}`.

Point the Next.js app at this URL with `NEXT_PUBLIC_API_URL` (Vercel env or `.env.production`).
