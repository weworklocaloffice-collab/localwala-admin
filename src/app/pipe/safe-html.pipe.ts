import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SecurityContext } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined, fallback: string): SafeHtml {
    const normalized = value && value.trim().length ? value : fallback;
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, normalized);
    return this.sanitizer.bypassSecurityTrustHtml(sanitized ?? fallback);
  }
}
