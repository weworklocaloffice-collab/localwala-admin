import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats raw PAISE (lean reads) as rupees.
 *
 * Every Jhatka admin read is `.lean()`, so `moneyField` values arrive as raw
 * paise — rendering them raw is a 100x display bug that looks exactly like a
 * pricing bug. Usage: `{{ order.finalTotal | paise }}` → `Rs 420.00`.
 */
@Pipe({
  name: 'paise',
  standalone: true,
})
export class PaisePipe implements PipeTransform {
  transform(value: unknown): string {
    const paise = Number(value);
    if (!Number.isFinite(paise)) {
      return '—';
    }
    const negative = paise < 0;
    const abs = Math.round(Math.abs(paise));
    const rupees = Math.floor(abs / 100);
    const tail = String(abs % 100).padStart(2, '0');
    return `${negative ? '-' : ''}Rs ${rupees}.${tail}`;
  }
}
