export type JhatkaOutletStatus = 'draft' | 'pending_approval' | 'active' | 'suspended' | 'closed';
export type JhatkaBusinessModel = 'direct' | 'franchise' | 'commission_partner';

export interface JhatkaCityRef {
  _id?: string;
  id?: string;
  name: string;
  state?: string;
}

export interface JhatkaBusiness {
  _id?: string;
  id?: string;
  name: string;
  code?: string;
  businessModel?: JhatkaBusinessModel;
  logo?: string;
  city?: JhatkaCityRef;
  owner?: string;
  contact?: Record<string, any>;
}

export interface JhatkaOutlet {
  _id?: string;
  id?: string;
  outletCode: string;
  business?: JhatkaBusiness | string;
  businessModel: JhatkaBusinessModel;
  name: string;
  slug?: string;
  logo?: string;
  cover?: string;
  description?: string;
  contact?: {
    name?: string;
    mobile?: number | string;
    countryCode?: string;
    email?: string;
  };
  address?: {
    line1?: string;
    line2?: string;
    landmark?: string;
    pincode?: string;
  };
  city?: JhatkaCityRef | string;
  locality?: JhatkaCityRef | string;
  location?: { type: 'Point'; coordinates: [number, number] } | null;
  territory?: Record<string, any>;
  ownDeliveryPartner?: boolean;
  driverPayoutMode?: 'business_pays' | 'platform_pays';
  operatingHours?: JhatkaOperatingHour[];
  serviceArea?: {
    radiusKm?: number;
    extendedRadiusKm?: number;
    extendedDeliveryFee?: number;
    localities?: Array<JhatkaCityRef | string>;
    maxActiveDeliveries?: number;
    dailyOrderCapacity?: number;
  };
  qualityPolicy?: {
    maxIntakeTemperatureC?: number;
    maxStorageTemperatureC?: number;
    minStorageTemperatureC?: number;
    maxTransitMinutes?: number;
    shelfLifeHoursRaw?: number;
    shelfLifeHoursPrepared?: number;
    shelfLifeHoursFish?: number;
    evidencePhotoRequiredAbove?: number;
    autoRejectOnTemperature?: boolean;
  };
  orderConfig?: {
    weightTolerancePct?: number;
    weightHardOverchargePct?: number;
    weightHardShortfallPct?: number;
    absorbOvercharge?: boolean;
    codEnabled?: boolean;
    pickupEnabled?: boolean;
    deliveryFeeType?: 'free' | 'flat';
    codTolerancePct?: number;
    minCodValue?: number;
    maxCodValue?: number;
    onlinePaymentEnabled?: boolean;
    paymentTimeoutMinutes?: number;
    acceptOrdersManually?: boolean;
    orderPrepMinutes?: number;
    minDeliveryMinutes?: number;
  };
  cancellationConfig?: {
    allowedUntil?: string;
    requireOutletConfirmAfter?: string;
    disputeWindowHours?: number;
    shortfallWindowHours?: number;
  };
  subscriptionConfig?: {
    enabled?: boolean;
    maxPerCustomer?: number;
    minCommitmentDays?: number;
    maxConsecutiveStockFailures?: number;
  };
  taxIdentity?: {
    gstin?: string;
    fssai?: {
      licenceNumber?: string;
      category?: 'registration' | 'state_licence' | 'central_licence';
      issuedAt?: string;
      expiresAt?: string;
      documentUrl?: string;
    };
  };
  packaging?: {
    types?: string[];
    defaultType?: string;
    minPackagingFee?: number;
  };
  paymentConfig?: {
    settlementCycle?: 'weekly' | 'monthly';
    payoutMethod?: 'bank' | 'wallet';
    bank?: {
      accountName?: string;
      accountNumber?: string;
      ifsc?: string;
      upiId?: string;
    };
    tdsApplicable?: boolean;
  };
  holdPolicy?: {
    holdTimeoutMinutes?: number;
    escalateAfterMinutes?: number;
  };
  verified?: boolean;
  rating?: number;
  ratingCount?: number;
  status: JhatkaOutletStatus;
  statusReason?: string;
  activatedAt?: string;
  suspendedAt?: string;
  suspensionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JhatkaOperatingHour {
  day: number;
  from?: string;
  to?: string;
  isClosed?: boolean;
}

export interface JhatkaOutletStats {
  total: number;
  byStatus: Record<string, number>;
  byBusinessModel: Record<string, number>;
}

export interface JhatkaCategory {
  _id?: string;
  id?: string;
  key: string;
  name: string;
  slug?: string;
  parent?: string | JhatkaCategory | null;
  description?: string;
  image?: string;
  icon?: string;
  featured?: boolean;
  defaultMeasurementMode?: 'WEIGHT' | 'COUNT';
  status?: boolean;
  sortOrder?: number;
  isSubCategory?: boolean;
}

export interface JhatkaProduct {
  _id?: string;
  id?: string;
  category?: JhatkaCategory | string;
  code: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  hsnCode?: string;
  taxRatePct?: number;
  shelfLifeDaysAmbient?: number;
  storageMode?: string;
  prepTimeMinutes?: number;
  isVariableWeight?: boolean;
  status?: boolean;
  sortOrder?: number;
}

export interface JhatkaVariant {
  _id?: string;
  id?: string;
  product?: JhatkaProduct | string;
  sku: string;
  name: string;
  image?: string;
  measurementMode: 'WEIGHT' | 'COUNT';
  unitLabel: string;
  priceBasis: 'per_kg' | 'per_piece' | 'per_dozen' | 'per_pack';
  pricePerUnit: number;
  packSize?: { value: number; unit: string };
  minOrderQty?: { value: number; unit: string };
  stepSize?: { value: number; unit: string };
  subscriptionEligible?: boolean;
  subscriptionChargeMode?: string;
  subscriptionCeilingPct?: number;
  estimatedAvailability?: number;
  availabilityUnit?: string;
  status?: boolean;
  sortOrder?: number;
}

export interface JhatkaOutletDetailResponse {
  outlet: JhatkaOutlet;
  compliance: Array<Record<string, any>>;
}

export interface JhatkaListResponse<T> {
  [key: string]: any;
  count: number;
  page?: number;
  limit?: number;
  total?: number;
  results?: T[];
}
export interface JhatkaQualityRejectionReason {
  _id?: string;
  id?: string;
  code: string;
  label: string;
  description?: string;
  category: string;
  severity: 'hard' | 'soft';
  autoReject?: boolean;
  fault?: string;
  wastageCause?: string;
  affectsSupplierRating?: boolean;
  sortOrder?: number;
  status?: boolean;
  translations?: Array<{ locale?: string; label?: string; description?: string }>;
}
