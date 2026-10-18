import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SaleCommissions } from '../sale-commissions/sale-commissions';

/**
 * Bank commissions (plan §10.2 row 30, §5.10). Fixed BANK filter —
 * revenue from bank agreements on disbursed loans.
 */
@Component({
  selector: 'app-real-estate-bank-commissions',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: '../sale-commissions/sale-commissions.html',
})
export class BankCommissions extends SaleCommissions {
  override beneficiaryType: string = 'BANK';
  override titleKey: string = 'realEstate_bank_commissions';
  override subtitleKey: string = 'realEstate_bank_commissions_subtitle';

  constructor(
    public override api: ApiService,
    public override util: UtilService,
  ) {
    super(api, util);
  }
}
