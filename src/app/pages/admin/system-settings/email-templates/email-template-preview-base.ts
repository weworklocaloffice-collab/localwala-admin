import { ChangeDetectorRef } from '@angular/core';

export abstract class EmailTemplatePreviewBase {
  protected capturePlaceholders = false;

  constructor(protected cdr: ChangeDetectorRef) {}

  previewValue(value: string | null | undefined, placeholder: string): string {
    return this.capturePlaceholders ? placeholder : value ?? placeholder;
  }

  protected captureEmailContent(): string | null {
    this.capturePlaceholders = true;
    this.cdr.detectChanges();
    try {
      const contentElement = document.getElementById('emailContent');
      return contentElement ? contentElement.outerHTML : null;
    } finally {
      this.capturePlaceholders = false;
      this.cdr.detectChanges();
    }
  }
}
