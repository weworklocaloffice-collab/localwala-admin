import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { TaxonomyListBase } from '../taxonomy-list-base';
import { DialogDairyCategory } from '../dialog-category/dialog-category';
import { CatalogHealth } from '../catalog-health/catalog-health';

@Component({
  selector: 'app-dairy-categories',
  imports: [CommonModule, FormsModule, MaterialModule, CatalogHealth],
  templateUrl: './categories.html',
})
export class Categories extends TaxonomyListBase {
  constructor(api: ApiService, util: UtilService, dialogRef: MatDialog) {
    super(api, util, dialogRef);

    this.path = 'categories';
    this.listTitleKey = 'category_list';
    this.dialog = DialogDairyCategory;
    this.displayedColumn = ['name', 'key', 'sortOrder', 'status', 'action'];
    this.addedKey = 'ts_dairy_category_added';
    this.updatedKey = 'ts_dairy_category_updated';
    this.deletedKey = 'ts_dairy_category_deleted';
  }
}
