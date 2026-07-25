import { openrouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { createClient } from "@supabase/supabase-js";
import { promptTama } from "./prompt.js";

async function getSystemPrompt() {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return promptTama;

  try {
    const supabase = createClient(url, anonKey);
    const { data, error } = await supabase
      .from("site_settings")
      .select("ai_system_prompt")
      .eq("id", 1)
      .single();

    if (error || !data?.ai_system_prompt) return promptTama;
    return data.ai_system_prompt;
  } catch {
    return promptTama;
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ status: "ok" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request" });
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

    const systemPrompt = await getSystemPrompt();

    const result = await streamText({
      model: openrouter("google/gemini-2.5-flash-lite"),
      system: systemPrompt,
      messages: coreMessages,
      maxOutputTokens: 300,
      temperature: 0.7,
    });

    result.pipeTextStreamToResponse(res);
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({
      error: "Maaf, asisten AI sedang beristirahat. Silakan hubungi saya via Instagram.",
    });
  }
}
