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

After your API is live (e.g. on Render), add in Vercel:

**Project → Settings → Environment Variables**

| Name | Value | Environment |
|------|--------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.onrender.com` | Production (and Preview if you use a staging API) |

- Use your **real Render HTTPS URL**, **no trailing slash** (or stay consistent with how `fetch` builds the URL in `src/app/page.tsx`).
- Redeploy after saving env vars (Deployments → … → Redeploy), or push a commit.

`NEXT_PUBLIC_*` is baked into the browser bundle at **build time**, so it must be set in Vercel before/with each production build.

## 3. Match CORS on the API

On Render, set **`CORS_ORIGINS`** to your Vercel URL, e.g.  
`https://meridian-electronics-chatbot.vercel.app`  
(or your custom domain). Without this, the browser blocks `fetch` to the API.

## 4. CLI (optional)

```bash
cd apps/web
npx vercel        # link project & preview
npx vercel --prod # production
```

The `.vercel` folder is gitignored.
