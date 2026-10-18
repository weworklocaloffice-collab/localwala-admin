import { DomSanitizer } from '@angular/platform-browser';
import { SecurityContext } from '@angular/core';

function sanitizeContent(sanitizer: DomSanitizer, html: string | null | undefined, fallback: string): string {
  const normalized = html && html.trim().length ? html : fallback;
  const sanitized = sanitizer.sanitize(SecurityContext.HTML, normalized);
  return sanitized ?? fallback;
}

export function setSanitizedInnerHtml(
  elementId: string,
  sanitizer: DomSanitizer,
  html: string | null | undefined,
  fallback: string
) {
  applySanitizedInnerHtml(document.getElementById(elementId), sanitizer, html, fallback);
}

export function applySanitizedInnerHtml(
  elementRef: HTMLElement | null,
  sanitizer: DomSanitizer,
  html: string | null | undefined,
  fallback: string
) {
  if (!elementRef) {
    return;
  }
  elementRef.innerHTML = sanitizeContent(sanitizer, html, fallback);
}
