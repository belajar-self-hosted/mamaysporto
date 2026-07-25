import { Switch, Match } from "solid-js";

const PLATFORMS = [
  { key: "github", label: "GitHub", test: (u) => /github\.com/i.test(u) },
  { key: "linkedin", label: "LinkedIn", test: (u) => /linkedin\.com/i.test(u) },
  { key: "instagram", label: "Instagram", test: (u) => /instagram\.com/i.test(u) },
  { key: "twitter", label: "Twitter / X", test: (u) => /(twitter\.com|x\.com)/i.test(u) },
  { key: "facebook", label: "Facebook", test: (u) => /(facebook\.com|fb\.com)/i.test(u) },
  { key: "youtube", label: "YouTube", test: (u) => /(youtube\.com|youtu\.be)/i.test(u) },
  { key: "tiktok", label: "TikTok", test: (u) => /tiktok\.com/i.test(u) },
  { key: "whatsapp", label: "WhatsApp", test: (u) => /(wa\.me|whatsapp\.com)/i.test(u) },
  { key: "telegram", label: "Telegram", test: (u) => /(t\.me|telegram\.org)/i.test(u) },
  { key: "email", label: "Email", test: (u) => /^mailto:/i.test(u) },
];

/** Deteksi platform sosmed dari URL, dipakai untuk memilih ikon yang cocok secara otomatis. */
export function detectPlatform(url) {
  const value = (url || "").trim();
  if (!value) return "website";
  const found = PLATFORMS.find((p) => p.test(value));
  return found ? found.key : "website";
}

/** Nama platform yang terdeteksi dari URL, dipakai untuk aria-label / label baris di admin. */
export function platformLabel(url) {
  const found = PLATFORMS.find((p) => p.key === detectPlatform(url));
  return found ? found.label : "Website";
}

/** Ikon sosmed yang otomatis menyesuaikan dengan platform yang terdeteksi dari `props.url`. */
export default function SocialIcon(props) {
  const platform = () => detectPlatform(props.url);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <Switch
        fallback={
          <>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </>
        }
      >
        <Match when={platform() === "github"}>
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
        </Match>
        <Match when={platform() === "linkedin"}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </Match>
        <Match when={platform() === "instagram"}>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </Match>
        <Match when={platform() === "twitter"}>
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
        </Match>
        <Match when={platform() === "facebook"}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </Match>
        <Match when={platform() === "youtube"}>
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
        </Match>
        <Match when={platform() === "tiktok"}>
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </Match>
        <Match when={platform() === "whatsapp"}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </Match>
        <Match when={platform() === "telegram"}>
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </Match>
        <Match when={platform() === "email"}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </Match>
      </Switch>
    </svg>
  );
}
