import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  streamText,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from "ai";
import { promptTama } from "@/lib/prompt";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  headers: {
    "HTTP-Referer": process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000",
    "X-Title": "Tama AI Portfolio",
  },
});

// Simple in-memory rate limiter (works per instance)
const rateLimitMap = new Map();

export async function POST(req) {
  try {
    // 1. Basic IP Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 5; // Max 5 requests per minute per IP

    const userRecord = rateLimitMap.get(ip);
    if (userRecord && now - userRecord.startTime < windowMs) {
      if (userRecord.count >= maxRequests) {
        return new Response(
          JSON.stringify({ error: "Terlalu banyak permintaan. Silakan coba lagi nanti." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
      userRecord.count += 1;
    } else {
      rateLimitMap.set(ip, { count: 1, startTime: now });
    }

    // Clean up expired entries to prevent memory leak
    if (rateLimitMap.size > 1000) {
      const cutoff = now - windowMs;
      for (const [key, record] of rateLimitMap) {
        if (record.startTime < cutoff) rateLimitMap.delete(key);
      }
    }

    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return new Response("Invalid request", { status: 400 });
    }

    // 2. Limit message history length (last 10 messages) to save tokens
    const limitedMessages = messages.slice(-10);

    const coreMessages = limitedMessages.map((msg) => {
      let content = msg.content;

      if (!content && msg.parts) {
        content = msg.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("");
      }

      // 3. Limit character count per message to prevent massive prompt injection
      const safeContent = content ? content.slice(0, 500) : "";

      return {
        role: msg.role,
        content: safeContent,
      };
    });

    const lastMessage = coreMessages[coreMessages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      lastMessage.content += "\n\n[ATURAN MUTLAK: Kamu BUKAN asisten programmer. JANGAN PERNAH menjelaskan kode, mengeksekusi kode, menjawab pertanyaan matematika, atau memberikan informasi umum. Jika pertanyaan pengguna meminta penjelasan kode atau apapun di luar data diri profil Tama, KAMU WAJIB MENJAWAB HANYA DENGAN SATU KALIMAT INI: 'maaf saya tidak bisa menjawab pertanyaan tersebut'. Jangan tambahkan kata lain apapun.]";
    }

    const result = streamText({
      model: openrouter("google/gemini-2.5-flash-lite"),
      system: promptTama,
      messages: coreMessages,
      maxOutputTokens: 300, // 4. Limit output tokens to prevent long-winded answers
      temperature: 0.7,
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Maaf, asisten AI sedang beristirahat. Silakan hubungi saya via email.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
