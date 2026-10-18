import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import {
  HEADER_BANNER_MAX_UPLOAD_BYTES,
  HEADER_BANNER_MAX_UPLOAD_LABEL,
} from 'src/app/interfaces/admin.header.banner.interface';

export type DragDropUploadKind = 'image' | 'lottie';

/**
 * Drag-and-drop uploader for header banner assets.
 *
 * The existing media flow (`SelectMediaDialog`) has no drag-drop, no size check and no
 * dimension readout, so this is a focused component rather than a rewrite of the shared
 * dialog.
 *
 * Two asset kinds are supported because the platform's image endpoint is image-only by
 * policy and a Lottie animation is JSON. `kind` picks the accept filter and the server
 * side validator.
 *
 * Client validation here is a convenience only. The server is the authority — it enforces
 * the configured size limit, verifies image magic bytes, and parses Lottie payloads — so
 * when it rejects a file its message is surfaced verbatim rather than replaced with a
 * generic failure. That matters: a size or type mismatch needs to be visible, not silent.
 */
@Component({
  selector: 'app-drag-drop-upload',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './drag-drop-upload.html',
})
export class DragDropUpload {
  @Input() label: string = 'drag_drop_image_here';
  @Input() kind: DragDropUploadKind = 'image';
  @Input() maxBytes: number = HEADER_BANNER_MAX_UPLOAD_BYTES;
  @Input() maxLabel: string = HEADER_BANNER_MAX_UPLOAD_LABEL;
  /** Recommended pixel dimensions. Lottie is vector, so the ratio check is skipped. */
  @Input() recommendedRatio: number = 16 / 9;
  @Input() recommendedWidth: number = 1920;
  @Input() recommendedHeight: number = 1080;
  /** Existing stored path, so an edit form can show the current image. */
  @Input() value: string = '';
  @Input() mediaUrl: string = '';
  @Input() disabled: boolean = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() errorChange = new EventEmitter<string>();

  isDragging: boolean = false;
  isUploading: boolean = false;
  errorMessage: string = '';
  previewUrl: string = '';
  fileInfo: { name: string; size: string; width: number; height: number; ratioValid: boolean } | null = null;

  constructor(
    public api: ApiService,
    public util: UtilService
  ) {
    this.previewUrl = this.absoluteUrl(this.value);
  }

  get isLottie(): boolean {
    return this.kind === 'lottie';
  }

  /** Lottie accepts JSON and the zipped dotLottie container. */
  get acceptAttribute(): string {
    return this.isLottie
      ? '.json,.lottie,.zip,application/json,application/zip'
      : 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';
  }

  get acceptedLabel(): string {
    return this.isLottie
      ? this.util.appTranslate('supported_json_lottie_max')
      : this.util.appTranslate('supported_jpg_png_webp_max');
  }

  /** Translation key for the size limit, so the message stays localised. */
  get tooLargeKey(): string {
    return this.maxLabel === HEADER_BANNER_MAX_UPLOAD_LABEL ? 'file_too_large_2_MB' : 'file_too_large_generic';
  }

  ngOnChanges(): void {
    this.previewUrl = this.absoluteUrl(this.value);
  }

  absoluteUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = this.mediaUrl || this.api.mediaUrl || '';
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  humanSize(bytes: number): string {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  onDragOver(event: DragEvent): void {
    if (this.disabled || this.isUploading) return;
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    if (this.disabled || this.isUploading) return;
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (!files || !files.length) return;
    this.processFile(files[0]);
  }

  onFileChoose(event: Event): void {
    if (this.disabled || this.isUploading) return;
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || !files.length) return;
    this.processFile(files[0]);
    // Reset so re-picking the same file still fires a change event.
    input.value = '';
  }

  onChooseClick(input: HTMLInputElement): void {
    input.click();
  }

  onRemove(): void {
    this.previewUrl = '';
    this.fileInfo = null;
    this.errorMessage = '';
    this.valueChange.emit('');
    this.errorChange.emit('');
  }

  private isLottieFile(file: File): boolean {
    const name = (file.name || '').toLowerCase();
    if (name.endsWith('.json') || name.endsWith('.lottie') || name.endsWith('.zip')) return true;
    // Browsers report the generic `application/octet-stream` for dotLottie on some
    // platforms, so the extension check above stays the primary signal.
    return file.type === 'application/json' || file.type === 'application/zip' || file.type === 'application/x-zip-compressed';
  }

  private async processFile(file: File): Promise<void> {
    this.errorMessage = '';

    if (this.isLottie) {
      if (!this.isLottieFile(file)) {
        return this.fail('only_lottie_files_allowed');
      }
    } else if (!file.type.startsWith('image/')) {
      return this.fail('only_image_files_allowed');
    }

    if (file.size > this.maxBytes) {
      return this.fail(this.tooLargeKey);
    }

    this.isUploading = true;
    try {
      const response: any = await this.upload(file);
      const storedPath = response?.path;
      if (!storedPath) {
        return this.fail('upload_failed');
      }
      this.previewUrl = this.absoluteUrl(storedPath);
      this.valueChange.emit(storedPath);
      this.errorChange.emit('');
      if (!this.isLottie) {
        await this.describe(file);
      } else {
        this.fileInfo = { name: file.name, size: this.humanSize(file.size), width: 0, height: 0, ratioValid: true };
      }
    } catch (error: any) {
      // Prefer the server's own message. A rejected upload told us exactly why — a size
      // cap or an unsupported type — and swallowing that behind "upload failed" hides
      // the one detail the operator needs.
      const serverMessage = this.serverMessage(error);
      if (serverMessage) {
        this.failWith(serverMessage);
      } else {
        this.fail('upload_failed');
      }
    } finally {
      this.isUploading = false;
    }
  }

  private upload(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.uploadHeaderBannerAsset(file, this.kind).subscribe({ next: resolve, error: reject });
    });
  }

  /**
   * Pulls a human message out of an HttpErrorResponse.
   *
   * The API answers with `{ code, message, extra }`; anything else falls back to the
   * raw status so the operator is never left with an empty box.
   */
  private serverMessage(error: any): string {
    const payload = error && error.error ? error.error : null;
    if (payload && typeof payload === 'object' && payload.message) return this.readable(String(payload.message));
    if (payload && typeof payload === 'string' && payload.trim()) return this.readable(payload);
    if (error && error.message) return this.readable(String(error.message));
    return '';
  }

  /**
   * Reduces a response body to displayable text.
   *
   * Express 404s and gateway errors answer with a full HTML page. Showing that raw in the
   * drop zone is worse than useless, so the meaningful line is extracted: Express puts
   * "Cannot POST /path" inside `<pre>`, and anything else is stripped to its text.
   */
  private readable(body: string): string {
    if (!body.includes('<')) return body.trim();
    const pre = /<pre[^>]*>([\s\S]*?)<\/pre>/i.exec(body);
    const text = pre ? pre[1] : body.replace(/<[^>]*>/g, ' ');
    return text.replace(/\s+/g, ' ').trim();
  }

  /** Reads intrinsic dimensions so the operator sees 1920x1080 (16:9) like the boards. */
  private describe(file: File): Promise<void> {
    return new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          this.fileInfo = {
            name: file.name,
            size: this.humanSize(file.size),
            width: img.naturalWidth,
            height: img.naturalHeight,
            ratioValid: this.isRatioValid(img.naturalWidth, img.naturalHeight),
          };
          resolve();
        };
        img.onerror = () => {
          this.fileInfo = { name: file.name, size: this.humanSize(file.size), width: 0, height: 0, ratioValid: false };
          resolve();
        };
        img.src = reader.result as string;
      };
      reader.onerror = () => resolve();
      reader.readAsDataURL(file);
    });
  }

  private isRatioValid(width: number, height: number): boolean {
    if (!width || !height) return false;
    // 0.1 tolerance so 1918x1078 still reads as 16:9 for a human.
    return Math.abs(width / height - this.recommendedRatio) < 0.1;
  }

  private fail(key: string): void {
    this.setError(this.util.appTranslate(key));
  }

  /** Server messages are already prose, so they are shown verbatim. */
  private failWith(message: string): void {
    this.setError(message);
  }

  private setError(message: string): void {
    this.errorMessage = message;
    this.errorChange.emit(message);
  }
}
