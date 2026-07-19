import express from "express";
import cors from "cors";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { promptTama } from "./prompt.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3001;

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// CORS configuration (allow specific origin in production, or all for dev)
app.use(cors());
app.use(express.json());

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

// Simple in-memory rate limiter
const rateLimitMap = new Map();

app.post("/api/chat", async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown-ip";
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 10;

    const userRecord = rateLimitMap.get(ip);
    if (userRecord && now - userRecord.startTime < windowMs) {
      if (userRecord.count >= maxRequests) {
        return res.status(429).json({ error: "Terlalu banyak permintaan. Silakan coba lagi nanti." });
      }
      userRecord.count += 1;
    } else {
      rateLimitMap.set(ip, { count: 1, startTime: now });
    }

    if (rateLimitMap.size > 1000) {
      const cutoff = now - windowMs;
      for (const [key, record] of rateLimitMap) {
        if (record.startTime < cutoff) rateLimitMap.delete(key);
      }
    }

    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).send("Invalid request");
    }

    const limitedMessages = messages.slice(-10);

    const coreMessages = limitedMessages.map((msg) => {
      let content = msg.content;
      if (!content && msg.parts) {
        content = msg.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("");
      }
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

    const result = await streamText({
      model: openrouter("google/gemini-2.5-flash-lite"),
      system: promptTama,
      messages: coreMessages,
      maxOutputTokens: 300,
      temperature: 0.7,
    });

    result.pipeDataStreamToResponse(res);
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({
      error: "Maaf, asisten AI sedang beristirahat. Silakan hubungi saya via Instagram.",
    });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
