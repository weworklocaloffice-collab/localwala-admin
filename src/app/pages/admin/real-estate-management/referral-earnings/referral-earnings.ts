import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SaleCommissions } from '../sale-commissions/sale-commissions';

/**
 * Referral earnings (plan §10.2 row 28). BR-16: % of LocalWala's
 * commission, never of sale value. Fixed REFERRER filter.
 */
@Component({
  selector: 'app-real-estate-referral-earnings',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: '../sale-commissions/sale-commissions.html',
})
export class ReferralEarnings extends SaleCommissions {
  override beneficiaryType: string = 'REFERRER';
  override titleKey: string = 'realEstate_referral_earnings';
  override subtitleKey: string = 'realEstate_referral_earnings_subtitle';

  constructor(
    public override api: ApiService,
    public override util: UtilService,
  ) {
    super(api, util);
  }
}
