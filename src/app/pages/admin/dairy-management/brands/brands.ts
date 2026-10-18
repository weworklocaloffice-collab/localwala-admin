import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { TaxonomyListBase } from '../taxonomy-list-base';
import { DialogDairyBrand } from '../dialog-brand/dialog-brand';

@Component({
  selector: 'app-dairy-brands',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './brands.html',
})
export class Brands extends TaxonomyListBase {
  constructor(api: ApiService, util: UtilService, dialogRef: MatDialog) {
    super(api, util, dialogRef);

    this.path = 'brands';
    this.listTitleKey = 'dairy_brands';
    this.dialog = DialogDairyBrand;
    this.displayedColumn = ['name', 'country', 'sortOrder', 'status', 'action'];
    this.addedKey = 'ts_dairy_brand_added';
    this.updatedKey = 'ts_dairy_brand_updated';
    this.deletedKey = 'ts_dairy_brand_deleted';
  }
}
