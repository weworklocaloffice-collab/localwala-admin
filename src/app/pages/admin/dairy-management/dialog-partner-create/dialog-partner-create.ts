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
 * Creates a commission-partner agreement for an existing, verified outlet.
 *
 * The API has always accepted `POST /admin/partners`, but nothing in the panel
 * called it: there was no way to turn a direct outlet into a commission partner.
 * The outlet list is `?availableFor=commission_partner`, which the API filters to
 * verified, trading, direct outlets with no agreement, so this dialog cannot
 * offer something the create endpoint would reject.
 */
@Component({
  selector: 'app-dialog-partner-create',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-partner-create.html',
})
export class DialogPartnerCreate {
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;
  listOfOutlets: any[] = [];

  partnerForm = new FormGroup({
    business: new FormControl('', [Validators.required]),
    partnerCode: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    commissionPercentage: new FormControl('', [Validators.required]),
    commissionBasis: new FormControl('product_only'),
    payoutMethod: new FormControl('wallet'),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl(''),
    minimumGuarantee: new FormControl(''),
    notes: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogPartnerCreate>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.getOutlets();
  }

  get f() {
    return this.partnerForm.controls;
  }

  getOutlets() {
    this.api
      .get_private('v1/dairy/admin/outlets?availableFor=commission_partner&limit=100')
      .subscribe({
        next: (response: any) => {
          this.listOfOutlets = (response && response.outlets) || [];
          // A row action opens the dialog with its own outlet. It is eligible by
          // construction, but the list request is asynchronous, so add it
          // explicitly rather than depending on the two responses racing.
          if (this.data && this.data.outlet) {
            const alreadyListed = this.listOfOutlets.some(
              (outlet) => String(outlet._id) === String(this.data.outlet._id)
            );
            if (!alreadyListed) {
              this.listOfOutlets = [this.data.outlet, ...this.listOfOutlets];
            }
            this.partnerForm.patchValue({
              business: this.data.outlet._id,
              name: this.data.outlet.name || '',
            });
          }
        },
        error: (error: any) => {
          console.error('Could not load outlets for the partner dialog:', error);
        },
      });
  }

  get selectedOutlet(): any {
    const id = this.f['business'].value;
    if (!id) return null;
    return this.listOfOutlets.find((outlet) => String(outlet._id) === String(id)) || null;
  }

  get ownerName(): string {
    const owner = this.selectedOutlet && this.selectedOutlet.owner;
    if (!owner) return '';
    return [owner.firstName, owner.lastName].filter(Boolean).join(' ');
  }

  get ownerMissing(): boolean {
    return Boolean(this.f['business'].value) && !(this.selectedOutlet && this.selectedOutlet.owner);
  }

  onOutletChange() {
    const outlet = this.selectedOutlet;
    if (!outlet) return;
    if (!this.f['name'].value) {
      this.f['name'].setValue(outlet.name || '');
    }
  }

  outletLabel(outlet: any): string {
    if (outlet.city && outlet.city.name) {
      return `${outlet.name} · ${outlet.city.name}`;
    }
    return outlet.name;
  }

  /** 0-100, with empty handled by the required validator. */
  get commissionOutOfRange(): boolean {
    const raw = this.f['commissionPercentage'].value;
    if (raw === '' || raw === null || raw === undefined) {
      return false;
    }
    const value = Number(raw);
    if (isNaN(value)) {
      return true;
    }
    return value < 0 || value > 100;
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    const outlet = this.selectedOutlet;
    if (
      this.partnerForm.invalid ||
      this.commissionOutOfRange ||
      !outlet ||
      !outlet.owner ||
      this.isSubmit
    ) {
      return;
    }
    this.isSubmit = true;

    const value: any = this.partnerForm.value;
    const agreement: any = {
      startDate: value.startDate,
    };
    if (value.endDate) {
      agreement.endDate = value.endDate;
    }
    if (value.minimumGuarantee !== '' && value.minimumGuarantee !== null) {
      agreement.minimumGuarantee = Number(value.minimumGuarantee);
    }
    if (value.notes) {
      agreement.notes = value.notes;
    }

    const body: any = {
      business: value.business,
      user: outlet.owner._id,
      partnerCode: value.partnerCode,
      name: value.name,
      commissionPercentage: Number(value.commissionPercentage),
      commissionBasis: value.commissionBasis,
      payoutMethod: value.payoutMethod,
      agreement: agreement,
    };

    this.api.post_private('v1/dairy/admin/partners', body).subscribe({
      next: (response: any) => {
        this.isSubmit = false;
        this.dialogRef.close({ event: 'add', data: response });
      },
      error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onCancel() {
    this.dialogRef.close({ event: 'cancel' });
  }
}
