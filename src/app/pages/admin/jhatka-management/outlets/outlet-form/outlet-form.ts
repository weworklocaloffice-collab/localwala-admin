import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { JhatkaAdminService } from '../../jhatka-admin.service';
import { JhatkaBusiness, JhatkaCityRef, JhatkaOutlet } from '../../jhatka.models';
import { CreateBusinessDialog } from './create-business-dialog';

@Component({
  selector: 'app-jhatka-outlet-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MaterialModule],
  templateUrl: './outlet-form.html',
  styles: [
    `
      .form-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 18px;
      }
      .eyebrow {
        color: var(--mat-sys-primary);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .page-title {
        font-size: 28px;
        line-height: 1.2;
        font-weight: 700;
        margin: 4px 0 6px;
      }
      .page-copy {
        color: var(--mat-sys-on-surface-variant);
        font-size: 14px;
        max-width: 720px;
        margin: 0;
      }
      .section-title {
        font-size: 17px;
        font-weight: 700;
        margin: 0 0 4px;
      }
      .section-copy {
        font-size: 13px;
        color: var(--mat-sys-on-surface-variant);
        margin: 0 0 16px;
      }
      .step-body {
        padding: 24px 6px 12px;
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 4px 16px;
      }
      .span-2 {
        grid-column: 1 / -1;
      }
      .form-grid mat-form-field {
        width: 100%;
      }
      .media-card {
        border: 1px dashed var(--mat-sys-outline);
        border-radius: 14px;
        padding: 10px;
        cursor: pointer;
        background: var(--mat-sys-surface-container-lowest);
        height: 100%;
      }
      .media-preview {
        width: 100%;
        height: 118px;
        object-fit: cover;
        border-radius: 10px;
        display: block;
        background: var(--mat-sys-surface-container-high);
      }
      .media-label {
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .hour-row {
        display: grid;
        grid-template-columns: 120px 1fr 1fr 110px;
        gap: 12px;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }
      .hour-row:last-child {
        border-bottom: 0;
      }
      .day-label {
        font-size: 13px;
        font-weight: 600;
      }
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 0;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }
      .toggle-row:last-child {
        border-bottom: 0;
      }
      .toggle-title {
        font-size: 14px;
        font-weight: 600;
      }
      .toggle-copy {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        margin-top: 3px;
        max-width: 620px;
      }
      .save-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 18px;
      }
      .error-text {
        color: var(--mat-sys-error);
        font-size: 12px;
      }
      .status-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 10px;
        border-radius: 999px;
        background: var(--mat-sys-surface-container-high);
        font-size: 12px;
        font-weight: 600;
        text-transform: capitalize;
      }
      .status-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
      }
      .status-pending_approval {
        background: #fff4dd;
        color: #9a5b00;
      }
      .option-main {
        font-size: 14px;
        font-weight: 600;
      }
      .option-sub {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
      }
      .media-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: var(--mat-sys-on-surface-variant);
        font-size: 12px;
        text-align: center;
      }
      .media-empty .mat-icon {
        width: 26px;
        height: 26px;
        font-size: 26px;
      }
      .phone-grid {
        display: grid;
        grid-template-columns: 96px 1fr;
        gap: 12px;
      }
      .step-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        padding: 16px 6px 4px;
        margin-top: 8px;
        border-top: 1px solid var(--mat-sys-outline-variant);
      }
      .notice-box {
        display: flex;
        gap: 12px;
        padding: 14px;
        border-radius: 12px;
        background: var(--mat-sys-surface-container-high);
        color: var(--mat-sys-on-surface);
      }
      .notice-box .mat-icon {
        color: var(--mat-sys-primary);
        flex: 0 0 auto;
      }
      .review-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
        padding: 14px;
        border-radius: 12px;
        background: var(--mat-sys-surface-container-lowest);
        border: 1px solid var(--mat-sys-outline-variant);
      }
      .review-label {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--mat-sys-on-surface-variant);
      }
      .review-value {
        font-size: 14px;
        font-weight: 600;
        margin-top: 3px;
      }
      @media (max-width: 760px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        .span-2 {
          grid-column: auto;
        }
        .hour-row {
          grid-template-columns: 1fr 1fr;
        }
      }
    `,
  ],
})
export class JhatkaOutletForm {
  action: 'create' | 'edit' = 'create';
  outletId = '';
  isLoaded = true;
  isSaving = false;
  submitted = false;
  outlet: JhatkaOutlet | null = null;

  businesses: JhatkaBusiness[] = [];
  filteredBusinesses: JhatkaBusiness[] = [];
  cities: JhatkaCityRef[] = [];
  filteredCities: JhatkaCityRef[] = [];
  localities: JhatkaCityRef[] = [];
  filteredLocalities: JhatkaCityRef[] = [];

  businessCtrl = new FormControl<string | JhatkaBusiness>('');
  cityCtrl = new FormControl<string | JhatkaCityRef>('');
  localityCtrl = new FormControl<string | JhatkaCityRef>('');

  readonly dayOptions = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 0, label: 'Sunday' },
  ];
  readonly businessModels = ['direct', 'franchise', 'commission_partner'];
  readonly fssaiCategories = ['registration', 'state_licence', 'central_licence'];
  readonly driverPayoutModes = ['platform_pays', 'business_pays'];
  readonly settlementCycles = ['weekly', 'monthly'];
  readonly payoutMethods = ['bank', 'wallet'];

  outletForm = this.fb.group({
    outletCode: ['', [Validators.maxLength(24)]],
    business: ['', [Validators.required]],
    businessModel: ['direct', [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    logo: [''],
    cover: [''],
    contact: this.fb.group({
      name: [''],
      countryCode: ['+91'],
      mobile: [''],
      email: ['', [Validators.email]],
    }),
    address: this.fb.group({
      line1: ['', [Validators.required]],
      line2: [''],
      landmark: [''],
      pincode: [''],
    }),
    city: ['', [Validators.required]],
    locality: [''],
    latitude: [null as number | null],
    longitude: [null as number | null],
    serviceRadiusKm: [5, [Validators.min(0), Validators.max(50)]],
    extendedRadiusKm: [0, [Validators.min(0), Validators.max(20)]],
    extendedDeliveryFeeRupees: [0, [Validators.min(0)]],
    maxActiveDeliveries: [10, [Validators.min(0)]],
    dailyOrderCapacity: [0, [Validators.min(0)]],
    ownDeliveryPartner: [false],
    driverPayoutMode: ['platform_pays'],
    pickupEnabled: [false],
    codEnabled: [false],
    onlinePaymentEnabled: [true],
    acceptOrdersManually: [false],
    absorbOvercharge: [true],
    prepMinutes: [15, [Validators.min(0)]],
    minDeliveryMinutes: [25, [Validators.min(0)]],
    weightTolerancePct: [5, [Validators.min(0), Validators.max(25)]],
    gstin: [''],
    fssaiLicenceNumber: [''],
    fssaiCategory: [''],
    fssaiIssuedAt: [''],
    fssaiExpiresAt: [''],
    fssaiDocumentUrl: [''],
    settlementCycle: ['weekly'],
    payoutMethod: ['bank'],
    bankAccountName: [''],
    bankAccountNumber: [''],
    bankIfsc: [''],
    bankUpiId: [''],
    tdsApplicable: [false],
    operatingHours: this.fb.array([]),
  });

  constructor(
    private fb: FormBuilder,
    public admin: JhatkaAdminService,
    public appApi: ApiService,
    public util: UtilService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
  ) {
    this.outletId = this.route.snapshot.paramMap.get('id') || '';
    this.action = this.outletId ? 'edit' : 'create';
    this.setHours([]);
    this.getLookups();
    if (this.action === 'edit') {
      this.getOutlet();
    }
  }

  get f() {
    return this.outletForm.controls as Record<string, AbstractControl>;
  }

  get hours(): FormArray {
    return this.outletForm.get('operatingHours') as FormArray;
  }

  get contact(): FormGroup {
    return this.outletForm.get('contact') as FormGroup;
  }

  get address(): FormGroup {
    return this.outletForm.get('address') as FormGroup;
  }

  get isEdit(): boolean {
    return this.action === 'edit';
  }

  get pageTitle(): string {
    return this.action === 'create' ? 'Create outlet' : 'Edit outlet';
  }

  get pageCopy(): string {
    return this.action === 'create'
      ? 'Build the outlet record in four steps. It starts as pending approval and never goes live automatically.'
      : 'Update identity, coverage, operations and compliance. Status changes are deliberate actions from the outlet page.';
  }

  getLookups() {
    this.admin.getBusinesses().subscribe({
      next: (response) => {
        this.businesses = response?.businesses || [];
        this.filteredBusinesses = this.businesses.slice();
        this.syncBusinessDisplay();
      },
      error: (error) => this.util.handleError(error, 'admin'),
    });

    this.admin.getCities().subscribe({
      next: (cities) => {
        this.cities = cities || [];
        this.filteredCities = this.cities.slice();
        this.syncCityDisplay();
      },
      error: (error) => this.util.handleError(error, 'admin'),
    });
  }

  getOutlet() {
    this.isLoaded = false;
    this.admin.getOutlet(this.outletId).subscribe({
      next: ({ outlet }) => {
        this.outlet = outlet;
        this.patchForm(outlet);
        this.isLoaded = true;
      },
      error: (error) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  patchForm(outlet: JhatkaOutlet) {
    const business = outlet.business as JhatkaBusiness | string;
    const city = outlet.city as JhatkaCityRef | string;
    const locality = outlet.locality as JhatkaCityRef | string;
    const tax: any = outlet.taxIdentity || {};
    const fssai: any = tax.fssai || {};
    const payment: any = outlet.paymentConfig || {};
    const bank: any = payment.bank || {};
    const area: any = outlet.serviceArea || {};
    const orders: any = outlet.orderConfig || {};

    this.outletForm.patchValue({
      outletCode: outlet.outletCode || '',
      business: this.admin.idOf(business),
      businessModel: outlet.businessModel || 'direct',
      name: outlet.name || '',
      description: outlet.description || '',
      logo: outlet.logo || '',
      cover: outlet.cover || '',
      contact: {
        name: outlet.contact?.name || '',
        countryCode: outlet.contact?.countryCode || '+91',
        mobile: outlet.contact?.mobile !== undefined ? String(outlet.contact.mobile) : '',
        email: outlet.contact?.email || '',
      },
      address: {
        line1: outlet.address?.line1 || '',
        line2: outlet.address?.line2 || '',
        landmark: outlet.address?.landmark || '',
        pincode: outlet.address?.pincode || '',
      },
      city: this.admin.idOf(city),
      locality: this.admin.idOf(locality),
      latitude: outlet.location?.coordinates?.[1] ?? null,
      longitude: outlet.location?.coordinates?.[0] ?? null,
      serviceRadiusKm: area.radiusKm ?? 5,
      extendedRadiusKm: area.extendedRadiusKm ?? 0,
      extendedDeliveryFeeRupees: (area.extendedDeliveryFee ?? 0) / 100,
      maxActiveDeliveries: area.maxActiveDeliveries ?? 10,
      dailyOrderCapacity: area.dailyOrderCapacity ?? 0,
      ownDeliveryPartner: outlet.ownDeliveryPartner === true,
      driverPayoutMode: outlet.driverPayoutMode || 'platform_pays',
      pickupEnabled: orders.pickupEnabled === true,
      codEnabled: orders.codEnabled === true,
      onlinePaymentEnabled: orders.onlinePaymentEnabled !== false,
      acceptOrdersManually: orders.acceptOrdersManually === true,
      absorbOvercharge: orders.absorbOvercharge !== false,
      prepMinutes: orders.orderPrepMinutes ?? 15,
      minDeliveryMinutes: orders.minDeliveryMinutes ?? 25,
      weightTolerancePct: orders.weightTolerancePct ?? 5,
      gstin: tax.gstin || '',
      fssaiLicenceNumber: fssai.licenceNumber || '',
      fssaiCategory: fssai.category || '',
      fssaiIssuedAt: this.dateInput(fssai.issuedAt),
      fssaiExpiresAt: this.dateInput(fssai.expiresAt),
      fssaiDocumentUrl: fssai.documentUrl || '',
      settlementCycle: payment.settlementCycle || 'weekly',
      payoutMethod: payment.payoutMethod || 'bank',
      bankAccountName: bank.accountName || '',
      bankAccountNumber: bank.accountNumber || '',
      bankIfsc: bank.ifsc || '',
      bankUpiId: bank.upiId || '',
      tdsApplicable: payment.tdsApplicable === true,
    });

    this.businessCtrl.setValue((business as JhatkaBusiness)?.name || '');
    this.cityCtrl.setValue((city as JhatkaCityRef)?.name || '');
    this.localityCtrl.setValue((locality as JhatkaCityRef)?.name || '');
    this.setHours(outlet.operatingHours || []);
    this.syncBusinessDisplay();
    this.syncCityDisplay();
    if (this.admin.idOf(city)) {
      this.getLocalities(this.admin.idOf(city), this.admin.idOf(locality));
    }
  }

  setHours(existing: Array<any>) {
    this.hours.clear();
    this.dayOptions.forEach((day) => {
      const saved = existing.find((row) => Number(row.day) === day.value);
      this.hours.push(
        this.fb.group({
          day: [day.value],
          from: [saved?.from || '09:00'],
          to: [saved?.to || '21:00'],
          isClosed: [saved ? saved.isClosed === true : false],
        })
      );
    });
  }

  dateInput(value: any): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  }

  syncBusinessDisplay() {
    const id = this.outletForm.get('business')?.value;
    const selected = this.businesses.find((business) => this.admin.idOf(business) === id);
    if (selected && !(this.businessCtrl.value instanceof Object)) {
      this.businessCtrl.setValue(selected);
    }
  }

  syncCityDisplay() {
    const id = this.outletForm.get('city')?.value;
    const selected = this.cities.find((city) => this.admin.idOf(city) === id);
    if (selected && !(this.cityCtrl.value instanceof Object)) {
      this.cityCtrl.setValue(selected);
    }
    if (this.action === 'create' && id) {
      this.refreshOutletCode(id);
    }
  }

  refreshOutletCode(cityId: string) {
    if (this.action !== 'create' || !cityId) {
      return;
    }
    this.admin.getNextOutletCode(cityId).subscribe({
      next: (response) => {
        if (this.action === 'create' && !this.outletForm.get('outletCode')?.dirty) {
          this.outletForm.patchValue({ outletCode: response?.outletCode || '' });
        }
      },
      error: () => undefined,
    });
  }

  filterBusinesses(value: string | JhatkaBusiness) {
    const query = typeof value === 'string' ? value.toLowerCase().trim() : '';
    this.filteredBusinesses = query
      ? this.businesses.filter((business) =>
          `${business.name} ${business.code || ''}`.toLowerCase().includes(query)
        )
      : this.businesses.slice();
  }

  filterCities(value: string | JhatkaCityRef) {
    const query = typeof value === 'string' ? value.toLowerCase().trim() : '';
    this.filteredCities = query
      ? this.cities.filter((city) => city.name.toLowerCase().includes(query))
      : this.cities.slice();
  }

  filterLocalities(value: string | JhatkaCityRef) {
    const query = typeof value === 'string' ? value.toLowerCase().trim() : '';
    this.filteredLocalities = query
      ? this.localities.filter((locality) => locality.name.toLowerCase().includes(query))
      : this.localities.slice();
  }

  onBusinessSelected(event: any) {
    this.selectBusiness(event.option.value);
  }

  openCreateBusiness() {
    this.dialog
      .open(CreateBusinessDialog, {
        data: { cities: this.cities },
        width: '680px',
        maxWidth: '90vw',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((business: JhatkaBusiness | null) => {
        if (!business) return;
        this.businesses = [
          business,
          ...this.businesses.filter((row) => this.admin.idOf(row) !== this.admin.idOf(business)),
        ];
        this.filterBusinesses(this.businessCtrl.value || '');
        this.selectBusiness(business);
      });
  }

  private selectBusiness(business: JhatkaBusiness) {
    this.outletForm.patchValue({
      business: this.admin.idOf(business),
      businessModel: business.businessModel || this.outletForm.get('businessModel')?.value,
    });
    this.businessCtrl.setValue(business);
    if (business.city) {
      const city = business.city as JhatkaCityRef;
      const cityId = this.admin.idOf(city);
      this.outletForm.patchValue({ city: cityId });
      this.cityCtrl.setValue(city);
      this.getLocalities(cityId);
      this.refreshOutletCode(cityId);
    }
  }

  onCitySelected(event: any) {
    const city: JhatkaCityRef = event.option.value;
    this.outletForm.patchValue({ city: this.admin.idOf(city), locality: '' });
    this.localityCtrl.setValue('');
    this.getLocalities(this.admin.idOf(city));
    if (this.action === 'create') {
      this.refreshOutletCode(this.admin.idOf(city));
    }
  }

  onLocalitySelected(event: any) {
    const locality: JhatkaCityRef = event.option.value;
    this.outletForm.patchValue({ locality: this.admin.idOf(locality) });
  }

  getLocalities(cityId: string, selectedId = '') {
    this.localities = [];
    this.filteredLocalities = [];
    this.localityCtrl.setValue('');
    if (!cityId) {
      return;
    }
    this.admin.getLocalities(cityId).subscribe({
      next: (localities) => {
        this.localities = localities || [];
        this.filteredLocalities = this.localities.slice();
        if (selectedId) {
          const selected = this.localities.find((locality) => this.admin.idOf(locality) === selectedId);
          if (selected) {
            this.localityCtrl.setValue(selected);
          }
        }
      },
      error: () => {},
    });
  }

  displayBusiness = (value: string | JhatkaBusiness | null): string =>
    typeof value === 'string' ? value : value?.name || '';

  displayCity = (value: string | JhatkaCityRef | null): string =>
    typeof value === 'string' ? value : value?.name || '';

  pickMedia(target: 'logo' | 'cover' | 'fssaiDocumentUrl') {
    const value = this.outletForm.get(target)?.value || '';
    this.dialog
      .open(SelectMediaDialog, {
        data: { value },
        disableClose: true,
        autoFocus: false,
        restoreFocus: false,
        height: 'calc(100% - 30px)',
        width: 'calc(100% - 30px)',
        maxWidth: '100%',
        maxHeight: '100%',
        panelClass: 'full-width-dialog',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.event === 'select' && result.data) {
          this.outletForm.get(target)?.setValue(result.data);
        }
      });
  }

  isInvalid(control: AbstractControl | null): boolean {
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  save() {
    this.submitted = true;
    this.outletForm.markAllAsTouched();
    if (this.outletForm.invalid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.isSaving = true;
    const body = this.payload();
    const request$ =
      this.action === 'create'
        ? this.admin.createOutlet(body)
        : this.admin.updateOutlet(this.outletId, body);

    request$.subscribe({
      next: (response: any) => {
        this.isSaving = false;
        this.util.onSuccess(this.action === 'create' ? 'jhatka_outlet_created' : 'jhatka_outlet_updated');
        const id = this.admin.idOf(response?.outlet) || this.outletId;
        this.router.navigate(['/admin/jhatka-management/outlet-detail', id]);
      },
      error: (error) => {
        this.isSaving = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  payload(): Record<string, any> {
    const value: any = this.outletForm.getRawValue();
    const latitude = this.numberOrNull(value.latitude);
    const longitude = this.numberOrNull(value.longitude);

    const body: Record<string, any> = {
      outletCode: String(value.outletCode || '').toUpperCase().trim() || undefined,
      business: value.business,
      businessModel: value.businessModel,
      name: String(value.name || '').trim(),
      description: value.description?.trim() || '',
      serviceArea: {
        radiusKm: Number(value.serviceRadiusKm || 0),
        extendedRadiusKm: Number(value.extendedRadiusKm || 0),
        extendedDeliveryFee: Math.round(Number(value.extendedDeliveryFeeRupees || 0) * 100),
        maxActiveDeliveries: Number(value.maxActiveDeliveries || 0),
        dailyOrderCapacity: Number(value.dailyOrderCapacity || 0),
      },
      ownDeliveryPartner: !!value.ownDeliveryPartner,
      driverPayoutMode: value.driverPayoutMode,
      operatingHours: (value.operatingHours || []).map((row: any) => {
        if (row.isClosed) {
          return { day: Number(row.day), isClosed: true };
        }
        return {
          day: Number(row.day),
          from: row.from,
          to: row.to,
          isClosed: false,
        };
      }),
      orderConfig: {
        pickupEnabled: !!value.pickupEnabled,
        codEnabled: !!value.codEnabled,
        onlinePaymentEnabled: !!value.onlinePaymentEnabled,
        acceptOrdersManually: !!value.acceptOrdersManually,
        absorbOvercharge: !!value.absorbOvercharge,
        orderPrepMinutes: Number(value.prepMinutes || 0),
        minDeliveryMinutes: Number(value.minDeliveryMinutes || 0),
        weightTolerancePct: Number(value.weightTolerancePct || 0),
      },
      paymentConfig: {
        settlementCycle: value.settlementCycle,
        payoutMethod: value.payoutMethod,
        tdsApplicable: !!value.tdsApplicable,
      },
    };

    if (value.logo) body['logo'] = value.logo;
    if (value.cover) body['cover'] = value.cover;
    if (value.city) body['city'] = value.city;
    if (value.locality) body['locality'] = value.locality;
    if (latitude !== null && longitude !== null) {
      body['location'] = { type: 'Point', coordinates: [longitude, latitude] };
    }

    const contact: Record<string, any> = {};
    if (value.contact?.name?.trim()) contact['name'] = value.contact.name.trim();
    if (value.contact?.countryCode) contact['countryCode'] = value.contact.countryCode;
    const mobile = String(value.contact?.mobile || '').replace(/\D/g, '');
    if (mobile) contact['mobile'] = Number(mobile);
    if (value.contact?.email?.trim()) contact['email'] = value.contact.email.trim();
    if (Object.keys(contact).length) {
      body['contact'] = contact;
    }

    const address: Record<string, any> = {
      line1: value.address?.line1?.trim() || '',
    };
    if (value.address?.line2?.trim()) address['line2'] = value.address.line2.trim();
    if (value.address?.landmark?.trim()) address['landmark'] = value.address.landmark.trim();
    if (value.address?.pincode?.trim()) address['pincode'] = value.address.pincode.trim();
    body['address'] = address;

    const fssai: Record<string, any> = {};
    if (value.fssaiLicenceNumber?.trim()) fssai['licenceNumber'] = value.fssaiLicenceNumber.trim();
    if (value.fssaiCategory) fssai['category'] = value.fssaiCategory;
    if (value.fssaiIssuedAt) fssai['issuedAt'] = value.fssaiIssuedAt;
    if (value.fssaiExpiresAt) fssai['expiresAt'] = value.fssaiExpiresAt;
    if (value.fssaiDocumentUrl) fssai['documentUrl'] = value.fssaiDocumentUrl;

    const taxIdentity: Record<string, any> = {};
    if (value.gstin?.trim()) taxIdentity['gstin'] = value.gstin.trim().toUpperCase();
    if (Object.keys(fssai).length) taxIdentity['fssai'] = fssai;
    if (Object.keys(taxIdentity).length) {
      body['taxIdentity'] = taxIdentity;
    }

    const bank: Record<string, any> = {};
    if (value.bankAccountName?.trim()) bank['accountName'] = value.bankAccountName.trim();
    if (value.bankAccountNumber?.trim()) bank['accountNumber'] = value.bankAccountNumber.trim();
    if (value.bankIfsc?.trim()) bank['ifsc'] = value.bankIfsc.trim().toUpperCase();
    if (value.bankUpiId?.trim()) bank['upiId'] = value.bankUpiId.trim();
    if (Object.keys(bank).length) {
      body['paymentConfig'].bank = bank;
    }

    return body;
  }

  numberOrNull(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  cancel() {
    if (this.action === 'edit') {
      this.router.navigate(['/admin/jhatka-management/outlet-detail', this.outletId]);
    } else {
      this.router.navigate(['/admin/jhatka-management/outlets']);
    }
  }
}
