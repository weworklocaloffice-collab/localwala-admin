import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { UtilService } from 'src/app/services/util-service';
import { JhatkaAdminService } from '../../jhatka-admin.service';
import { JhatkaCityRef } from '../../jhatka.models';

export interface CreateBusinessDialogData {
  cities: JhatkaCityRef[];
}

@Component({
  selector: 'app-jhatka-create-business-dialog',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  template: `
    <h2 mat-dialog-title>Create business</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="dialog-body">
        <p class="dialog-copy">
          A business owns one or more outlets. Create it once, then pick it in the
          outlet form.
        </p>

        <div class="form-grid">
          <mat-form-field appearance="outline" class="span-2">
            <mat-label>Business name</mat-label>
            <input matInput formControlName="name" maxlength="160" />
            <mat-error *ngIf="form.get('name')?.hasError('required')">
              Enter the business name.
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Business model</mat-label>
            <mat-select formControlName="businessModel">
              <mat-option *ngFor="let model of businessModels" [value]="model">
                {{ model.replace('_', ' ') | titlecase }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Business code</mat-label>
            <input matInput formControlName="code" maxlength="40" placeholder="Optional" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="span-2">
            <mat-label>City</mat-label>
            <mat-select formControlName="city">
              <mat-option *ngFor="let city of cities" [value]="admin.idOf(city)">
                {{ city.name }}
                <span *ngIf="city.state"> &middot; {{ city.state }}</span>
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('city')?.hasError('required')">
              Choose the city this business operates in.
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Contact name</mat-label>
            <input matInput formControlName="contactName" maxlength="120" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Contact mobile</mat-label>
            <input matInput formControlName="mobile" maxlength="15" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="span-2">
            <mat-label>Contact email</mat-label>
            <input matInput type="email" formControlName="email" />
            <mat-error *ngIf="form.get('email')?.hasError('email')">
              Enter a valid email.
            </mat-error>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" [mat-dialog-close]="null">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="isSaving">
          {{ isSaving ? 'Creating...' : 'Create business' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .dialog-body {
        min-width: min(620px, 82vw);
        padding-top: 8px;
      }
      .dialog-copy {
        margin: 0 0 16px;
        opacity: 0.75;
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }
      .span-2 {
        grid-column: span 2;
      }
      @media (max-width: 640px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        .span-2 {
          grid-column: span 1;
        }
      }
    `,
  ],
})
export class CreateBusinessDialog implements OnInit {
  isSaving = false;
  readonly businessModels = ['direct', 'franchise', 'commission_partner'];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(160)]],
    businessModel: ['direct', [Validators.required]],
    code: [''],
    city: ['', [Validators.required]],
    contactName: [''],
    mobile: [''],
    email: ['', [Validators.email]],
  });

  constructor(
    private fb: FormBuilder,
    public admin: JhatkaAdminService,
    private util: UtilService,
    private ref: MatDialogRef<CreateBusinessDialog, any>,
    @Inject(MAT_DIALOG_DATA) public data: CreateBusinessDialogData,
  ) {}

  get cities(): JhatkaCityRef[] {
    return this.data?.cities || [];
  }

  ngOnInit() {
    if (this.cities.length) return;
    this.admin.getCities().subscribe({
      next: (cities) => (this.data.cities = cities || []),
      error: (error) => this.util.handleError(error, 'admin'),
    });
  }

  save() {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const contact: Record<string, any> = {};
    if (value.contactName) contact['name'] = value.contactName.trim();
    if (value.mobile) contact['mobile'] = value.mobile.trim();
    if (value.email) contact['email'] = value.email.trim();

    const body: Record<string, any> = {
      name: (value.name || '').trim(),
      businessModel: value.businessModel,
      city: value.city,
    };
    if (value.code) body['code'] = value.code.trim();
    if (Object.keys(contact).length) body['contact'] = contact;

    this.isSaving = true;
    this.admin.createBusiness(body).subscribe({
      next: (response) => this.ref.close(response?.business || null),
      error: (error) => {
        this.isSaving = false;
        this.util.handleError(error, 'admin');
      },
    });
  }
}
