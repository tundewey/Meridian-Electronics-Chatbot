import { NextRequest, NextResponse } from "next/server";

/** Prefer server-only env so the browser never needs CORS to your FastAPI host. */
function backendBase(): string {
  const raw =
    process.env.API_URL?.trim() ||
    process.env.FASTAPI_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "";
  return raw.replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
  const base = backendBase();
  if (!base) {
    return NextResponse.json(
      {
        error:
          "Missing API_URL. In Vercel → Settings → Environment Variables, add API_URL = your FastAPI HTTPS URL (e.g. https://….onrender.com), apply to Production, then Redeploy.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);
  try {
    const res = await fetch(`${base}/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "upstream request failed";
    return NextResponse.json(
      {
        error: `Could not reach backend (${base}): ${msg}. Check that the API is running and the URL is correct.`,
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
