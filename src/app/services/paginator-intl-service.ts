import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class PaginatorIntlService extends MatPaginatorIntl {
  constructor(private translate: TranslateService) {
    super();
    this.translate.onLangChange.subscribe(() => {
      this.getAndInitTranslations();
    });
    this.getAndInitTranslations();
  }

  getAndInitTranslations() {
    this.itemsPerPageLabel = this.translate.instant('paginator_itemsPerPage');
    this.nextPageLabel = this.translate.instant('paginator_nextPage');
    this.previousPageLabel = this.translate.instant('paginator_previousPage');
    this.firstPageLabel = this.translate.instant('paginator_firstPage');
    this.lastPageLabel = this.translate.instant('paginator_lastPage');

    this.changes.next();
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return this.translate.instant('paginator_range', { start: 0, end: 0, length });
    }
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;

    return this.translate.instant('paginator_range', {
      start: startIndex + 1,
      end: endIndex,
      length
    });
  };
}
