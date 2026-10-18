import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { TaxonomyListBase } from '../taxonomy-list-base';
import { DialogDairySubCategory } from '../dialog-sub-category/dialog-sub-category';

@Component({
  selector: 'app-dairy-sub-categories',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './sub-categories.html',
})
export class SubCategories extends TaxonomyListBase {
  /**
   * The parent category filter.
   *
   * Sent as the `category` query param, which the API validates as an ObjectId. An
   * unset filter is left off the query entirely by the base rather than sent as an
   * empty string, which would be a 400.
   */
  selectedCategory: string = '';

  /** Parent options for the filter, loaded once. */
  listOfCategories: any[] = [];

  constructor(api: ApiService, util: UtilService, dialogRef: MatDialog) {
    super(api, util, dialogRef);

    this.path = 'sub_categories';
    this.listTitleKey = 'dairy_sub_categories';
    this.dialog = DialogDairySubCategory;
    this.displayedColumn = ['name', 'category', 'sortOrder', 'status', 'action'];
    this.addedKey = 'ts_dairy_sub_category_added';
    this.updatedKey = 'ts_dairy_sub_category_updated';
    this.deletedKey = 'ts_dairy_sub_category_deleted';
  }

  override ngOnInit() {
    super.ngOnInit();
    this.getCategories();
  }

  getCategories() {
    this.api.get_private('v1/dairy/admin/catalog/categories?limit=100').subscribe({
      next: (response: any) => {
        if (response && response.results) {
          this.listOfCategories = response.results;
        }
      },
      error: (error: any) => {
        // The list still works unfiltered, so this is not worth a toast — the filter
        // select will simply be empty.
        console.error('Could not load dairy categories for the filter:', error);
      },
    });
  }

  override extraQueryParams() {
    return { category: this.selectedCategory };
  }

  onCategoryFilter() {
    this.currentPage = 0;
    this.getList();
  }
}
