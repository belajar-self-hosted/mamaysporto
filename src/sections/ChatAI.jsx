import { createEffect, createSignal, onMount, For } from "solid-js";
import { useChat } from "@ai-sdk/solid";
import { reveal } from "../lib/scrollReveal";
import "./ChatAI.css";

export default function ChatAI() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    error,
  } = useChat({
    api: "/api/chat",
    streamProtocol: "text",
  });

  let chatAreaRef;

  const scrollToBottom = () => {
    if (chatAreaRef) {
      chatAreaRef.scrollTo({
        top: chatAreaRef.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  createEffect(() => {
    // Whenever messages change, scroll to bottom
    messages();
    scrollToBottom();
  });

  const handleSend = (textToSend) => {
    if (!textToSend.trim()) return;
    const wordCount = textToSend.trim().split(/\s+/).length;
    if (wordCount > 20) {
      alert(
        "Batas maksimal input adalah 20 kata. Mohon persingkat pertanyaan Anda.",
      );
      return;
    }
    const userMessageCount = messages().filter((m) => m.role === "user").length;
    if (userMessageCount >= 10) {
      alert("Batas maksimal 10 pertanyaan telah tercapai. Chat akan direset, silahkan mulai kembali.");
      // Note: @ai-sdk/solid might not expose setMessages directly like react,
      // but refreshing the page or reloading works. We will just alert for now.
      return;
    }

    append({ content: textToSend, role: "user" });
  };

  return (
    <section id="chatai" class="section chat-section" use:reveal>
      <div class="chat-container neo-box">
        <header class="chat-header">
          <h2>YOWMAN</h2>
          <p>Asisten Pribadi Tama</p>
        </header>

        <main class="chat-area" ref={chatAreaRef}>
          {messages().length === 0 && (
            <div class="chat-empty-state">
              <p>Halo! Saya Yowman asisten Tama.</p>
              <p>
                Saya bisa bantu menjawab pertanyaan anda apapun tentang Tama sebisa mungkin.
              </p>
              <div class="chat-suggestion-container">
                <button
                  class="chat-suggestion-button"
                  onClick={() => handleSend("Siapa itu Tama?")}
                >
                  Siapa itu Tama?
                </button>
                <button
                  class="chat-suggestion-button"
                  onClick={() => handleSend("Domisili mana dia tinggal?")}
                >
                  Domisili mana dia tinggal?
                </button>
                <button
                  class="chat-suggestion-button"
                  onClick={() => handleSend("Kuliah dimana si Tama?")}
                >
                  Kuliah dimana si Tama?
                </button>
                <button
                  class="chat-suggestion-button"
                  onClick={() => handleSend("Apa yang sedang dia kembangkan?")}
                >
                  Apa yang sedang dia kembangkan?
                </button>
              </div>
            </div>
          )}

          <For each={messages()}>
            {(m) => (
              <div
                class={
                  m.role === "user" ? "chat-user-message" : "chat-ai-message"
                }
              >
                <div class="chat-message-label">
                  {m.role === "user" ? "Anda" : "Yowman"}
                </div>
                <div class="chat-message-content">{m.content}</div>
              </div>
            )}
          </For>

          {isLoading() && !error() && (
            <div class="chat-ai-message">
              <div class="chat-message-label">Yowman</div>
              <div class="chat-message-content">Mengetik...</div>
            </div>
          )}

          {error() && (
            <div class="chat-ai-message">
              <div
                class="chat-message-label"
                style="background: #ff5470; color: white;"
              >
                Error
              </div>
              <div
                class="chat-message-content"
                style="background: #ffd0d6; border-color: #ff5470;"
              >
                Yowman sedang istirahat, tunggu sebentar yah.
              </div>
            </div>
          )}
        </main>

        <form onSubmit={handleSubmit} class="chat-form">
          <input
            class="chat-input neo-input"
            value={input()}
            placeholder="Tanya sesuatu tentang Tama..."
            onInput={handleInputChange}
            disabled={isLoading()}
          />
          <button type="submit" class="chat-button" disabled={isLoading()}>
            KIRIM
          </button>
        </form>
      </div>
    </section>
  );
}
