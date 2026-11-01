import { normalizeUrl } from "./url";

const ALLOWED_TAGS = new Set(["A", "B", "BR", "EM", "I", "LI", "OL", "P", "STRONG", "U", "UL"]);
const DROP_CONTENT_TAGS = new Set(["IFRAME", "OBJECT", "SCRIPT", "STYLE", "SVG", "MATH", "TEMPLATE"]);

/** Keep the small rich-text subset used by the About field and strip active markup. */
export function sanitizeAboutHtml(value) {
  if (typeof value !== "string" || !value) return "";
  if (typeof DOMParser === "undefined" || typeof document === "undefined") return "";

  const parsed = new DOMParser().parseFromString(value, "text/html");
  const safeRoot = document.createElement("div");

  const copySafeNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent || "");
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const source = node;
    const tag = source.tagName.toUpperCase();
    if (DROP_CONTENT_TAGS.has(tag)) return null;

    if (!ALLOWED_TAGS.has(tag)) {
      const fragment = document.createDocumentFragment();
      for (const child of source.childNodes) {
        const safeChild = copySafeNode(child);
        if (safeChild) fragment.append(safeChild);
      }
      return fragment;
    }

    const safeElement = document.createElement(tag.toLowerCase());
    if (tag === "A") {
      const href = normalizeUrl(source.getAttribute("href"));
      if (href) {
        safeElement.setAttribute("href", href);
        safeElement.setAttribute("target", "_blank");
        safeElement.setAttribute("rel", "noopener noreferrer");
      }
    }

    for (const child of source.childNodes) {
      const safeChild = copySafeNode(child);
      if (safeChild) safeElement.append(safeChild);
    }
    return safeElement;
  };

  for (const child of parsed.body.childNodes) {
    const safeChild = copySafeNode(child);
    if (safeChild) safeRoot.append(safeChild);
  }

  return safeRoot.innerHTML;
}
