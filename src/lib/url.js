const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

/** Normalize a URL while rejecting active or unsupported schemes. */
export function normalizeUrl(value) {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed || trimmed === "#") return trimmed;
  if (/[\u0000-\u001f\u007f]/.test(trimmed) || trimmed.includes("\\") || trimmed.startsWith("//")) return "";

  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("?")) return trimmed;

  const explicitScheme = trimmed.match(/^([a-z][a-z0-9+.-]*:)/i);
  const candidate = explicitScheme ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (!SAFE_SCHEMES.has(parsed.protocol)) return "";
    if ((parsed.protocol === "http:" || parsed.protocol === "https:") && (!parsed.hostname || parsed.username || parsed.password)) {
      return "";
    }
    if ((parsed.protocol === "mailto:" || parsed.protocol === "tel:") && !parsed.pathname) return "";
    return parsed.href;
  } catch {
    return "";
  }
}
