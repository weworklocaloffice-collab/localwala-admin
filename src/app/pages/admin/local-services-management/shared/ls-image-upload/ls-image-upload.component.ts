import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';

@Component({
  selector: 'app-ls-image-upload',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './ls-image-upload.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LsImageUploadComponent),
      multi: true,
    },
  ],
  styles: [
    `
      .ls-image-upload {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ls-image-upload-label {
        color: #475569;
        font-size: 13px;
        font-weight: 600;
      }
      .ls-image-upload-row {
        align-items: flex-start;
        display: flex;
        gap: 14px;
      }
      .ls-image-upload-preview {
        align-items: center;
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
        border-radius: 8px;
        color: #94a3b8;
        display: flex;
        flex: 0 0 auto;
        height: 90px;
        justify-content: center;
        overflow: hidden;
        width: 120px;
      }
      .ls-image-upload-preview img {
        height: 100%;
        object-fit: cover;
        width: 100%;
      }
      .ls-image-upload-body {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }
      .ls-image-upload-actions {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .ls-image-upload-hint {
        color: #64748b;
        font-size: 12px;
      }
      .ls-image-upload-error {
        color: #dc2626;
        font-size: 12px;
      }
      .ls-image-upload-input {
        display: none;
      }
    `,
  ],
})
export class LsImageUploadComponent implements ControlValueAccessor {
  @Input() label = 'Image';
  @Input() maxSizeMb = 5;
  @Input() showUrlInput = false;
  @Input() accept = 'image/jpeg,image/png,image/webp';
  @Output() uploadingChange = new EventEmitter<boolean>();
  @Output() uploadError = new EventEmitter<string>();

  value = '';
  disabled = false;
  uploading = false;
  error = '';
  previewError = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private api: ApiService) {}

  writeValue(value: string | null): void {
    this.value = value || '';
    this.previewError = false;
    this.error = '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    if (!file) return;

    this.error = '';
    const allowedTypes = (this.accept || '')
      .split(',')
      .map((type) => type.trim().toLowerCase())
      .filter(Boolean);
    if (!allowedTypes.includes((file.type || '').toLowerCase())) {
      this.setError('Unsupported image format. Use JPG, PNG or WebP.');
      input.value = '';
      return;
    }
    if (file.size > this.maxSizeMb * 1024 * 1024) {
      this.setError('Image must be ' + this.maxSizeMb + ' MB or smaller.');
      input.value = '';
      return;
    }

    this.setUploading(true);
    this.api.uploadFile(file).subscribe({
      next: (response: any) => {
        const path = this.extractPath(response);
        if (!path) {
          this.setError('Upload failed: no image URL returned.');
          this.setUploading(false);
          input.value = '';
          return;
        }
        this.value = path;
        this.previewError = false;
        this.error = '';
        this.onChange(path);
        this.onTouched();
        this.setUploading(false);
        input.value = '';
      },
      error: (error: any) => {
        this.setError(error && error.error && error.error.message ? error.error.message : 'Image upload failed.');
        this.setUploading(false);
        input.value = '';
      },
    });
  }

  onUrlInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.previewError = false;
    this.onChange(this.value);
  }

  onUrlBlur(): void {
    this.value = (this.value || '').trim();
    this.onChange(this.value);
    this.onTouched();
  }

  onPreviewError(): void {
    this.previewError = true;
  }

  remove(): void {
    if (this.disabled || this.uploading) return;
    this.value = '';
    this.previewError = false;
    this.error = '';
    this.onChange('');
    this.onTouched();
  }

  private extractPath(response: any): string {
    const value =
      response &&
      (response.url ||
        response.fileUrl ||
        response.path ||
        (response.data && (response.data.url || response.data.fileUrl || response.data.path)));
    return typeof value === 'string' ? value : '';
  }

  private setUploading(value: boolean): void {
    if (this.uploading === value) return;
    this.uploading = value;
    this.uploadingChange.emit(value);
  }

  private setError(message: string): void {
    this.error = message;
    this.uploadError.emit(message);
    this.onTouched();
  }
}