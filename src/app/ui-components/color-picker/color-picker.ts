import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { UtilService } from 'src/app/services/util-service';

/**
 * Colour picker with a native swatch, a hex text field and an optional palette row.
 *
 * Deliberately dependency free: the project ships no colour picker package and the
 * boards only need one swatch plus a hex value, so `<input type="color">` covers it
 * without pulling in a library.
 *
 * Emits normalised `#RRGGBB` values so the payload never carries a shorthand form the
 * Flutter hex parser would reject.
 */
@Component({
  selector: 'app-color-picker',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './color-picker.html',
})
export class ColorPicker {
  /** Current value as `#RRGGBB`, or empty for "unset". */
  @Input() label: string = '';
  @Input() hint: string = '';
  @Input() value: string = '';
  @Input() placeholder: string = '#FFE6D3';
  @Input() palette: string[] = [];
  @Input() disabled: boolean = false;

  @Output() valueChange = new EventEmitter<string>();

  /** Bound to the native swatch, which only ever emits `#rrggbb`. */
  swatchValue: string = '#000000';

  constructor(public util: UtilService) {
    this.setFromValue(this.value);
  }

  ngOnChanges(): void {
    this.setFromValue(this.value);
  }

  /**
   * Normalises any accepted hex form to `#RRGGBB`.
   *
   * Accepts `#abc`, `abc`, `#aabbcc`, `#aabbccdd` and `0x` prefixes so an operator
   * pasting from a design tool does not have to normalise by hand.
   */
  private normalize(raw: string): string {
    if (!raw) return '';
    let hex = String(raw).trim();
    if (hex.startsWith('0x') || hex.startsWith('0X')) hex = hex.substring(2);
    if (hex.startsWith('#')) hex = hex.substring(1);
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('');
    }
    if (hex.length === 8) hex = hex.substring(0, 6);
    if (hex.length !== 6) return '';
    if (!/^[a-f\d]{6}$/i.test(hex)) return '';
    return `#${hex.toUpperCase()}`;
  }

  setFromValue(raw: string): void {
    const normalized = this.normalize(raw);
    this.swatchValue = normalized || '#000000';
    if (!this.isHexFieldValid(raw)) {
      this.hexField = raw ?? '';
      return;
    }
    this.hexField = normalized;
  }

  isHexFieldValid(raw: string): boolean {
    if (!raw || !String(raw).trim()) return true;
    return this.normalize(raw) !== '';
  }

  hexField: string = '';

  onSwatchChange(value: string): void {
    const normalized = this.normalize(value) || '#000000';
    this.swatchValue = normalized;
    this.hexField = normalized;
    this.valueChange.emit(normalized);
  }

  onHexInput(value: string): void {
    this.hexField = value;
    if (!this.isHexFieldValid(value)) return;
    const normalized = this.normalize(value);
    if (normalized) this.swatchValue = normalized;
    this.valueChange.emit(normalized);
  }

  /** Translation key for the invalid-hex message. */
  get invalidHexKey(): string {
    return 'hex_invalid';
  }

  onPalettePick(color: string): void {
    const normalized = this.normalize(color);
    if (!normalized) return;
    this.swatchValue = normalized;
    this.hexField = normalized;
    this.valueChange.emit(normalized);
  }

  onClear(): void {
    this.hexField = '';
    this.valueChange.emit('');
  }
}