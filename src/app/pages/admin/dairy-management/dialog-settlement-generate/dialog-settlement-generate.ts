import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  Validators,
  FormGroup,
} from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-settlement-generate',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-settlement-generate.html',
})
export class DialogSettlementGenerate {
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;

  listOfPartners: any[] = [];
  listOfFranchises: any[] = [];

  /**
   * `partyType` is a screen-side convenience only.
   *
   * The API takes `partner` **xor** `franchise` — exactly one — and a settlement
   * cannot straddle both. Picking the kind first is what makes it impossible to
   * send both by accident.
   */
  generateForm = new FormGroup({
    partyType: new FormControl('partner', [Validators.required]),
    partyId: new FormControl('', [Validators.required]),
    period: new FormControl('monthly', [Validators.required]),
    reference: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogSettlementGenerate>,
    public util: UtilService,
    public api: ApiService,
  ) {
    this.getParties();
  }

  get f() {
    return this.generateForm.controls;
  }

  /**
   * Which kind of counterparty this settlement is for.
   *
   * `FormControl.value` is typed `string | null`, so it is narrowed here once
   * rather than at every use. `partner` is the safe fallback: it is the default the
   * form starts on, and the xor check in the API will reject the request if the id
   * does not actually belong to a partner.
   */
  get partyType(): string {
    return this.f['partyType'].value || 'partner';
  }

  get parties(): any[] {
    return this.partyType === 'franchise' ? this.listOfFranchises : this.listOfPartners;
  }

  getParties() {
    // Both lists are needed because switching `partyType` swaps the dropdown without
    // a round trip.
    this.api.get_private('v1/dairy/admin/partners?limit=100').subscribe({
      next: (response: any) => {
        if (response && response.partners) {
          this.listOfPartners = response.partners;
        }
      },
      error: (error: any) => {
        console.error('Could not load partners:', error);
      },
    });

    this.api.get_private('v1/dairy/admin/franchises?limit=100').subscribe({
      next: (response: any) => {
        if (response && response.franchises) {
          this.listOfFranchises = response.franchises;
        }
      },
      error: (error: any) => {
        console.error('Could not load franchises:', error);
      },
    });
  }

  onPartyTypeChange() {
    // The selected id belongs to the other list, and sending it would fail the
    // xor check or point at the wrong agreement.
    this.f['partyId'].setValue('');
  }

  onGenerate() {
    this.haveSubmitClicked = true;
    if (this.generateForm.invalid || this.isSubmit) {
      return;
    }
    this.isSubmit = true;

    const value: any = this.generateForm.value;
    const body: any = {
      period: value.period,
    };
    // Exactly one of the two, as the API requires.
    body[this.partyType] = value.partyId;

    const reference = String(value.reference || '').trim();
    if (reference) {
      body.reference = reference;
    }

    this.api.post_private('v1/dairy/settlements/generate', body).subscribe({
      next: (response: any) => {
        this.isSubmit = false;
        this.dialogRef.close({ event: 'generated', data: response });
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
