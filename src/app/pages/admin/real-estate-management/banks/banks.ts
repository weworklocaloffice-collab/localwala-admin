import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MatDialog } from '@angular/material/dialog';
import { DialogBankCreate } from '../dialog-bank-create/dialog-bank-create';
import { DialogBankMemberAdd } from '../dialog-bank-member-add/dialog-bank-member-add';
import { DialogBankMembers } from '../dialog-bank-members/dialog-bank-members';

/**
 * Banks — admin creates the bank and links role-'bank' users as
 * officers. Without an active RealEstateBankMember, /auth/bank/login
 * rejects that user, so this screen is what makes a bank user able
 * to sign in to the bank portal.
 */
@Component({
  selector: 'app-real-estate-banks',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './banks.html',
})
export class Banks {
  isLoaded: boolean = false;
  list: any[] = [];
  displayedColumn: string[] = ['name', 'code', 'status', 'action'];

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    this.api.get_private('v1/realestate/admin/banks').subscribe({
      next: (response: any) => {
        this.list = (response && response.results) || [];
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onCreate() {
    this.dialog
      .open(DialogBankCreate, { disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'created') {
          this.util.onSuccess('ts_created');
          this.getList();
        }
      });
  }

  onAddMember(row: any) {
    this.dialog
      .open(DialogBankMemberAdd, { data: { bank: row }, disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'added') {
          this.util.onSuccess('ts_created');
          this.getList();
        }
      });
  }

  onEdit(row: any) {
    this.dialog
      .open(DialogBankCreate, { disableClose: true, data: row })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'created') {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        }
      });
  }

  onMembers(row: any) {
    this.dialog
      .open(DialogBankMembers, { data: { bank: row }, disableClose: false, minWidth: '520px' })
      .afterClosed()
      .subscribe(() => {
        this.getList();
      });
  }
}
