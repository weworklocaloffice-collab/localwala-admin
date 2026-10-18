import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SaleCommissions } from '../sale-commissions/sale-commissions';

/**
 * Executive earnings (plan §10.2 row 29). Fixed EXECUTIVE filter.
 */
@Component({
  selector: 'app-real-estate-executive-earnings',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: '../sale-commissions/sale-commissions.html',
})
export class ExecutiveEarnings extends SaleCommissions {
  override beneficiaryType: string = 'EXECUTIVE';
  override titleKey: string = 'realEstate_executive_earnings';
  override subtitleKey: string = 'realEstate_executive_earnings_subtitle';

  constructor(
    public override api: ApiService,
    public override util: UtilService,
  ) {
    super(api, util);
  }
}
