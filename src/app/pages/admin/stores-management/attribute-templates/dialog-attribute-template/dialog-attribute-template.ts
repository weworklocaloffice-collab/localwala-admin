/**
 * LocalWala – Local Commerce & Delivery Platform
 * (NodeJS, MongoDB, Angular & Flutter)
 *
 * Copyright © 2026 WeWorkLocal Private Limited
 * https://weworklocal.in/
 *
 * This source code is confidential.
 * Unauthorized copying, redistribution, resale, publication,
 * modification, or use of this source code in any public or
 * commercial repository is strictly prohibited.
 *
 * Ownership Fingerprint:
 * LWL|WWL|2026|LOCALWALA|NODE
 */

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  Validators,
  FormGroup,
} from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Create/edit dialog for attribute templates (BR-11).
 *
 * Field names match `attributeTemplateCreate/Update`: name, type (the
 * 9-value enum — `type` is required, there is no `key`/`description`/
 * `isActive` on this model), options as value/label rows, unit, the five
 * behaviour flags, displayOrder, boolean status. There is deliberately no
 * key field: the previous dialog sent `{name, key, description, isActive}`,
 * three fields the backend does not accept, and omitted `type`, so every
 * create 400d. Paths are under `/catalog/`, like the list.
 */
@Component({
  selector: 'app-dialog-attribute-template',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-attribute-template.html',
})
export class DialogAttributeTemplate {
  action: string = 'create';
  id: string = '';
  haveSubmitClicked: boolean = false;

  types = ['text', 'number', 'select', 'multi_select', 'boolean', 'color', 'size', 'date', 'file'];

  templateForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    type: new FormControl('', [Validators.required]),
    unit: new FormControl(''),
    optionsText: new FormControl(''),
    filterable: new FormControl(false),
    searchable: new FormControl(false),
    required: new FormControl(false),
    variantAxis: new FormControl(false),
    isOrganicRelevant: new FormControl(false),
    displayOrder: new FormControl<number | null>(null),
    status: new FormControl(true),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogAttributeTemplate>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data && this.data.action == 'edit') {
      this.action = 'edit';
      const values = this.data.values;
      this.id = values._id;
      this.templateForm.patchValue({
        name: values.name,
        type: values.type,
        unit: values.unit || '',
        optionsText: (values.options || []).map((o: any) => `${o.value}:${o.label}`).join('\n'),
        filterable: values.filterable === true,
        searchable: values.searchable === true,
        required: values.required === true,
        variantAxis: values.variantAxis === true,
        isOrganicRelevant: values.isOrganicRelevant === true,
        displayOrder: values.displayOrder ?? null,
        status: values.status !== false,
      });
    }
  }

  get f() {
    return this.templateForm.controls;
  }

  /** One `value:label` pair per line. A line without a colon is its own label. */
  buildOptions(): any[] {
    return String(this.templateForm.value.optionsText || '')
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line)
      .map((line: string, i: number) => {
        const at = line.indexOf(':');
        return at === -1
          ? { value: line, label: line, sortOrder: i }
          : { value: line.slice(0, at).trim(), label: line.slice(at + 1).trim(), sortOrder: i };
      });
  }

  body() {
    const value: any = this.templateForm.value;
    const body: any = {
      name: value.name.trim(),
      type: value.type,
      options: this.buildOptions(),
      filterable: !!value.filterable,
      searchable: !!value.searchable,
      required: !!value.required,
      variantAxis: !!value.variantAxis,
      isOrganicRelevant: !!value.isOrganicRelevant,
      status: value.status !== false,
    };
    if (value.unit) body.unit = value.unit;
    if (value.displayOrder !== null && value.displayOrder !== undefined && value.displayOrder !== '') {
      body.displayOrder = Number(value.displayOrder);
    }
    return body;
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (this.templateForm.invalid) {
      return;
    }

    const needsOptions = ['select', 'multi_select', 'color', 'size'].includes(this.templateForm.value.type || '');
    if (needsOptions && !this.buildOptions().length) {
      this.util.onError('stores_template_options_required', '');
      return;
    }

    const base = 'v1/admin/stores/catalog/attribute-templates';
    const request =
      this.action == 'create'
        ? this.api.post_private(base, this.body())
        : this.api.patch_private(base + '/' + this.id, this.body());

    request.subscribe({
      next: (response: any) => {
        this.dialogRef.close({ event: this.action == 'create' ? 'add' : 'update', data: response });
      },
      error: (error: any) => {
        const apiMessage =
          error && error.error && error.error.message ? error.error.message : '';
        if (apiMessage) {
          this.util.onError(apiMessage, '');
        } else {
          this.util.handleError(error, 'admin');
        }
      },
    });
  }
}
