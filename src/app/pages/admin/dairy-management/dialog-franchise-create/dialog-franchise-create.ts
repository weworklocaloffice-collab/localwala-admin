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

@Component({
  selector: 'app-dialog-franchise-create',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-franchise-create.html',
})
export class DialogFranchiseCreate {
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;
  listOfCities: any[] = [];
  listOfPartners: any[] = [];
  listOfOperators: any[] = [];
  operatorSearch: string = '';

  franchiseForm = new FormGroup({
    business: new FormControl('', [Validators.required]),
    operator: new FormControl('', [Validators.required]),
    franchiseCode: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    revenueSharePercentage: new FormControl('', [Validators.required]),
    revenueShareBasis: new FormControl('product_only'),
    joiningFee: new FormControl(0),
    royalty: new FormControl(0),
    royaltyFrequency: new FormControl('monthly'),
    supplyModel: new FormControl('platform_supplied'),
    procurementEnabled: new FormControl(false),
    city: new FormControl(''),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl(''),
    notes: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogFranchiseCreate>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.listOfCities = data.cities || [];
    this.getPartners();
    this.getOperators();
  }

  get f() {
    return this.franchiseForm.controls;
  }

  getPartners() {
    this.api.get_private('v1/dairy/admin/partners?limit=100').subscribe({
      next: (response: any) => {
        if (response && response.partners) {
          this.listOfPartners = response.partners;
        }
      },
      error: (error: any) => {
        console.error('Could not load outlets:', error);
      },
    });
  }

  /**
   * Operator candidates come from the dedicated endpoint rather than the partner
   * list, because `operator` is a `User` and the platform's only other user search
   * returns customers.
   */
  getOperators() {
    let httpParams = 'limit=100';
    if (this.operatorSearch) {
      httpParams += '&search=' + encodeURIComponent(this.operatorSearch);
    }
    this.api.get_private('v1/dairy/admin/franchise-operators?' + httpParams).subscribe({
      next: (response: any) => {
        if (response && response.results) {
          this.listOfOperators = response.results;
        }
      },
      error: (error: any) => {
        console.error('Could not load franchise operators:', error);
      },
    });
  }

  /** 0-100, with empty not counting as out of range. */
  get revenueShareOutOfRange(): boolean {
    const raw = this.f['revenueSharePercentage'].value;
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
    if (this.franchiseForm.invalid || this.revenueShareOutOfRange || this.isSubmit) {
      return;
    }
    this.isSubmit = true;

    const value: any = this.franchiseForm.value;
    const body: any = {
      business: value.business,
      operator: value.operator,
      franchiseCode: value.franchiseCode,
      name: value.name,
      revenueSharePercentage: Number(value.revenueSharePercentage),
      revenueShareBasis: value.revenueShareBasis,
      joiningFee: Number(value.joiningFee || 0),
      royalty: Number(value.royalty || 0),
      royaltyFrequency: value.royaltyFrequency,
      supplyModel: value.supplyModel,
      procurementEnabled: value.procurementEnabled === true,
      agreement: {
        startDate: value.startDate,
        notes: value.notes,
      },
    };

    if (value.endDate) {
      body.agreement.endDate = value.endDate;
    }
    // Omitted entirely when unset, so the API's `allow('', null)` never has to
    // interpret an empty string as a cleared city.
    if (value.city) {
      body.territory = { city: value.city };
    }

    this.api.post_private('v1/dairy/admin/franchises', body).subscribe({
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
