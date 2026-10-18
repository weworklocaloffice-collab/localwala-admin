import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { StoresListBase } from '../stores-list-base';
import { DialogAttributeTemplate } from './dialog-attribute-template/dialog-attribute-template';

/**
 * ATTRIBUTE TEMPLATES — reusable sets of fields for products/outlets
 * §7.5: Attribute Templates — pre-defined field sets applied to entities
 *
 * Templates define: key (immutable machine identifier), name, description,
 * field configuration, and status. Applied at product/outlet creation time.
 */
@Component({
  selector: 'app-store-attribute-templates',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './attribute-templates.html',
})
export class AttributeTemplates extends StoresListBase {
  constructor(
    api: ApiService,
    util: UtilService,
    dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    // Mounted at /v1/admin/stores/catalog (stores.admin.catalog.route).
    this.path = 'catalog/attribute-templates';
    this.listTitleKey = 'stores_attribute_templates_list';
    this.displayedColumn = ['name', 'type', 'options', 'flags', 'status', 'action'];
    this.archivedKey = 'st_attribute_template_archived';
  }

  override ngOnInit() {
    this.getList();
  }

  onCreate() {
    const dialogRef = this.dialog.open(DialogAttributeTemplate, {
      disableClose: true,
      data: { action: 'create' },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.event === 'add') {
        this.util.onSuccess(this.util.appTranslate('st_attribute_template_created'));
        this.getList();
      }
    });
  }

  onEdit(template: any) {
    const dialogRef = this.dialog.open(DialogAttributeTemplate, {
      disableClose: true,
      data: { action: 'edit', values: template },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.event === 'update') {
        this.util.onSuccess(this.util.appTranslate('st_attribute_template_updated'));
        this.getList();
      }
    });
  }
}