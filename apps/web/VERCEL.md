# Deploy the Next.js app on Vercel

## 1. Import the GitHub repo

1. Open [vercel.com/new](https://vercel.com/new) and sign in (GitHub is easiest).
2. **Import** [tundewey/Meridian-Electronics-Chatbot](https://github.com/tundewey/Meridian-Electronics-Chatbot) (or your fork).
3. **Root Directory:** set to **`apps/web`** (monorepo — this is required).
4. Framework: Vercel should auto-detect **Next.js**.  
   - **Build Command:** `npm run build` (default)  
   - **Output:** Next default (no change)
5. **Deploy** (the first build may take a few minutes).

## 2. Environment variable (production API)

The chat UI calls **`/api/chat`** on Vercel first; that **Route Handler** forwards to your FastAPI URL **from the server**, so the **browser does not need CORS** access to Render.

**Project → Settings → Environment Variables**

| Name | Value | Environment |
|------|--------|-------------|
| **`API_URL`** | `https://your-api.onrender.com` | Production (recommended) |

- **No trailing slash** on the URL.
- **`API_URL` is not exposed to the browser** (unlike `NEXT_PUBLIC_*`).
- If you already use `NEXT_PUBLIC_API_URL`, the proxy will use it as a **fallback** when `API_URL` is unset — but you must still use the **proxy** (the app uses `/api/chat`), so CORS from the browser to Render is no longer required for chat.

Redeploy after saving env vars (Deployments → … → Redeploy), or push a commit.

## 3. CORS on the API (optional for this setup)

Because the browser only talks to Vercel, **you do not need** to add your Vercel domain to FastAPI **`CORS_ORIGINS`** for the chat flow. Keep `CORS_ORIGINS` for **local dev** (e.g. `http://localhost:3000`) or if you call the API directly from other origins.

## 4. CLI (optional)

```bash
cd apps/web
npx vercel        # link project & preview
npx vercel --prod # production
```

The `.vercel` folder is gitignored.
