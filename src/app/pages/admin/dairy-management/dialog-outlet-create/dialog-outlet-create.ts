import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-outlet-create',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-outlet-create.html',
})
export class DialogOutletCreate {
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;
  listOfCities: any[] = [];
  listOfLocalities: any[] = [];
  showPassword: boolean = true;

  outletForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    mobile: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    businessName: new FormControl('', [Validators.required]),
    businessModel: new FormControl('direct', [Validators.required]),
    shortDescription: new FormControl(''),
    logo: new FormControl(''),
    cover: new FormControl(''),
    city: new FormControl('', [Validators.required]),
    locality: new FormControl('', [Validators.required]),

    partnerCode: new FormControl(''),
    partnerName: new FormControl(''),
    commissionPercentage: new FormControl(''),
    commissionBasis: new FormControl('product_only'),
    payoutMethod: new FormControl('wallet'),
    partnerStartDate: new FormControl(''),

    franchiseCode: new FormControl(''),
    franchiseName: new FormControl(''),
    revenueSharePercentage: new FormControl(''),
    revenueShareBasis: new FormControl('product_only'),
    joiningFee: new FormControl(0),
    royalty: new FormControl(0),
    royaltyFrequency: new FormControl('monthly'),
    supplyModel: new FormControl('platform_supplied'),
    procurementEnabled: new FormControl(false),
    franchiseCity: new FormControl(''),
    franchiseStartDate: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogOutletCreate>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.listOfCities = (data && data.cities) || [];
    if (!this.listOfCities.length) {
      this.loadCities();
    }
  }

  get f() {
    return this.outletForm.controls;
  }

  loadCities() {
    this.api.get_public('v1/public/register/getBasicDataDairyRequest').subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.listOfCities = response;
        }
      },
      error: () => {},
    });
  }

  onCityChange() {
    const city = this.listOfCities.find((c: any) => String(c._id) === String(this.f['city'].value));
    this.listOfLocalities = (city && city.localities) || [];
    this.f['locality'].setValue('');
  }

  model(): string {
    return this.f['businessModel'].value || 'direct';
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (this.outletForm.invalid || this.isSubmit) {
      return;
    }
    this.isSubmit = true;
    const v: any = this.outletForm.value;
    const cityObj = this.listOfCities.find((c: any) => String(c._id) === String(v.city));
    const localityObj = this.listOfLocalities.find((l: any) => String(l._id) === String(v.locality));
    const body: any = {
      firstName: v.firstName,
      lastName: v.lastName,
      countryCode: v.countryCode,
      mobile: v.mobile,
      email: v.email,
      password: v.password,
      businessName: v.businessName,
      businessModel: v.businessModel,
      shortDescription: v.shortDescription,
      logo: v.logo,
      cover: v.cover,
      city: v.city,
      locality: v.locality,
    };
    if (v.businessModel === 'commission_partner') {
      body.partnerCode = v.partnerCode;
      body.name = v.partnerName || v.businessName;
      body.commissionPercentage = v.commissionPercentage === '' ? null : Number(v.commissionPercentage);
      body.commissionBasis = v.commissionBasis;
      body.payoutMethod = v.payoutMethod;
      body.agreement = { startDate: v.partnerStartDate || new Date().toISOString() };
    }
    if (v.businessModel === 'franchise') {
      body.franchiseCode = v.franchiseCode;
      body.name = v.franchiseName || v.businessName;
      body.revenueSharePercentage = v.revenueSharePercentage === '' ? null : Number(v.revenueSharePercentage);
      body.revenueShareBasis = v.revenueShareBasis;
      body.joiningFee = Number(v.joiningFee || 0);
      body.royalty = Number(v.royalty || 0);
      body.royaltyFrequency = v.royaltyFrequency;
      body.supplyModel = v.supplyModel;
      body.procurementEnabled = v.procurementEnabled === true;
      body.territory = v.franchiseCity ? { city: v.franchiseCity } : undefined;
      body.agreement = { startDate: v.franchiseStartDate || new Date().toISOString() };
    }
    this.api.post_private('v1/dairy/admin/outlets', body).subscribe({
      next: () => {
        this.isSubmit = false;
        this.dialogRef.close({ event: 'add' });
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
