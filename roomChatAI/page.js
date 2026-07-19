'use client';

import { useChat } from '@ai-sdk/react';
import styles from './page.module.css';
import { useRef, useEffect, useState } from 'react';
import FloatingIcons from '../components/FloatingIcons';
import BackgroundText from '../components/BackgroundText';

export default function Chat() {
  const chatContext = useChat();
  const { messages, status, error } = chatContext;
  const [input, setInput] = useState('');
  const [modalMessage, setModalMessage] = useState(null);
  
  // Backward compatibility check for v4 vs older AI SDK versions
  const sendMessageFn = chatContext.sendMessage || chatContext.append;
  const isLoading = chatContext.isLoading || status === 'streaming' || status === 'submitted';

  const chatAreaRef = useRef(null);

  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem("hasSeenDeviceWarning");
    if (!hasSeen) {
      setModalMessage("Halo! Saya Yowman");
    }
  }, []);

  const handleCloseModal = () => {
    if (modalMessage === "Halo! Saya Yowman") {
      sessionStorage.setItem("hasSeenDeviceWarning", "true");
    }
    setModalMessage(null);
  };

  const handleInputChange = (e) => setInput(e.target.value);

  const handleSend = (textToSend) => {
    if (!textToSend.trim() || !sendMessageFn) return;

    const wordCount = textToSend.trim().split(/\s+/).length;
    if (wordCount > 20) {
      setModalMessage("Batas maksimal input adalah 20 kata. Mohon persingkat pertanyaan Anda.");
      return;
    }

    const userMessageCount = messages.filter((m) => m.role === "user").length;

    if (userMessageCount >= 10) {
      setModalMessage("Batas maksimal 10 pertanyaan telah tercapai. Chat akan direset, silahkan mulai dari awal kembali.");
      if (chatContext.setMessages) {
        chatContext.setMessages([]);
      }
      setInput("");
      return;
    }

    sendMessageFn({ content: textToSend, role: "user" });
    setInput("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <>
      {modalMessage && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p>{modalMessage}</p>
            <button className={styles.modalButton} onClick={handleCloseModal}>
              OK
            </button>
          </div>
        </div>
      )}
      <BackgroundText />
      <FloatingIcons />
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Yowman</h1>
          <p>Asisten Pribadi Tama</p>
        </header>

        <main className={styles.chatArea} ref={chatAreaRef} data-chat-area>
          {messages.length === 0 && (
            <div className={styles.emptyState}>
              <p>Halo! Saya adalah asisten Tama.</p>
              <p>
                Anda bisa bertanya tentang asal, pendidikan, keahlian, tech
                stack atau apapun tentang Tama.
              </p>
              <div className={styles.suggestionContainer}>
                <button className={styles.suggestionButton} onClick={() => handleSend("Siapa Tama sebenarnya?")}>Siapa Tama sebenarnya?</button>
                <button className={styles.suggestionButton} onClick={() => handleSend("Apa saja skill dan tech stack Tama?")}>Apa saja skill dan tech stack Tama?</button>
                <button className={styles.suggestionButton} onClick={() => handleSend("Punya pengalaman atau sertifikat apa?")}>Punya pengalaman atau sertifikat apa?</button>
                <button className={styles.suggestionButton} onClick={() => handleSend("Kenapa harus hire Tama?")}>Kenapa harus hire Tama?</button>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user" ? styles.userMessage : styles.aiMessage
              }
            >
              <div className={styles.messageLabel}>
                {m.role === "user" ? "Anda" : "Yowman"}
              </div>
              <div className={styles.messageContent}>
                {m.parts
                  ? m.parts.map((part, i) =>
                      part.type === "text" ? (
                        <span key={i}>{part.text}</span>
                      ) : null,
                    )
                  : m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={styles.aiMessage}>
              <div className={styles.messageLabel}>Asisten Tama</div>
              <div className={styles.messageContent}>Mengetik...</div>
            </div>
          )}
          {error && (
            <div className={styles.aiMessage} style={{ borderColor: "red" }}>
              <div className={styles.messageLabel} style={{ color: "red" }}>
                Error
              </div>
              <div className={styles.messageContent}>
                Maaf, asisten AI sedang beristirahat atau terjadi masalah
                jaringan. Silakan hubungi saya via Instagram.
              </div>
            </div>
          )}
        </main>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          className={styles.form}
        >
          <input
            className={styles.input}
            value={input}
            placeholder="Tanya sesuatu tentang Tama..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button type="submit" className={styles.button} disabled={isLoading}>
            Kirim
          </button>
        </form>

        <div className={styles.socialLinks}>
          <a
            href="https://www.instagram.com/sutanfannandya?igsh=eGF3azR5ZnRxNGdm&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialIcon}
            aria-label="Instagram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a
            href="https://github.com/fannandya"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialIcon}
            aria-label="GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/fannandya-sutan-2538a831b"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialIcon}
            aria-label="LinkedIn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}
