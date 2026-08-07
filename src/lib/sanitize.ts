import DOMPurify from "isomorphic-dompurify";

/**
 * Strips all HTML/script content from free-text user input before it is
 * persisted or rendered in the admin panel, preventing stored XSS.
 */
export function sanitizeText(value: string | null | undefined): string {
  if (!value) return "";
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}
