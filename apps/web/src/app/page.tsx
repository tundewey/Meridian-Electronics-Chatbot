// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }


"use client";

import { useState } from "react";

type ChatRole = "user" | "assistant";

type Message = { role: ChatRole; content: string };

/** Trimmed at runtime; empty in production if Vercel build lacked NEXT_PUBLIC_API_URL */
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();
const apiConfigured = API_BASE.length > 0;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    if (!apiConfigured) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Configuration error: NEXT_PUBLIC_API_URL is not set. In Vercel → Settings → Environment Variables, add NEXT_PUBLIC_API_URL with your Render API URL (https://…), apply to Production, then Redeploy.",
        },
      ]);
      return;
    }

    const userMessage: Message = { role: "user", content: input.trim() };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = (await res.json()) as { message?: { role: string; content: string } };
      // Adjust to match your real API response shape in Step 5, e.g. data.assistant or data.content
      const assistantText =
        typeof data.message?.content === "string"
          ? data.message.content
          : JSON.stringify(data);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantText },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "request failed"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 p-4">
      {!apiConfigured && (
        <div
          role="alert"
          className="rounded-lg border border-amber-500 bg-amber-50 px-4 py-3 text-sm text-gray-900 shadow-sm"
        >
          <p className="font-semibold text-amber-950">Backend URL not configured</p>
          <p className="mt-1 text-gray-800">
            Add{" "}
            <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs">
              NEXT_PUBLIC_API_URL
            </code>{" "}
            in Vercel → Project → Settings → Environment Variables (Production), e.g.{" "}
            <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs">
              https://your-api.onrender.com
            </code>
            , then <strong>Redeploy</strong>. Chat cannot send until this is set at build time.
          </p>
        </div>
      )}
      <ul className="flex flex-1 flex-col gap-2 overflow-y-auto rounded border border-zinc-300 bg-white/90 p-4 text-gray-900">
        {messages.map((m, i) => (
          <li
            key={i}
            className={
              m.role === "user"
                ? "self-end rounded bg-blue-100 px-3 py-2 text-gray-900"
                : "self-start rounded bg-gray-100 px-3 py-2 text-gray-900"
            }
          >
            {m.content}
          </li>
        ))}
      </ul>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="flex-1 rounded border border-zinc-400 bg-white px-3 py-2 text-gray-900 placeholder:text-zinc-500 disabled:opacity-60"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          disabled={loading || !apiConfigured}
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || !apiConfigured}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </main>
  );
}