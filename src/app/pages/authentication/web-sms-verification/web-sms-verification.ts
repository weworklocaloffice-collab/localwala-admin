import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-web-sms-verification',
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './web-sms-verification.html',
})
export class WebSmsVerification {

  id: string = '';
  // role: string = '';
  // status: string = 'created';

  constructor(
    private route: ActivatedRoute,
    public util: UtilService,
    private router: Router,
    private api: ApiService
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id != null && this.id != '') {
      this.onAuthLogin();
    } else {
      this.util.onError('ts_verification_failed', '');
      this.router.navigate(['/'], {
        replaceUrl: true,
        state: { flushed: true }
      });
    }
  }

  onAuthLogin() {
    try {
      this.api.get_public('v1/auth/web_verification/' + this.id).subscribe({
        next: (response: any) => {
          console.log(response);
          if (response && response.kind && response.kind == 'vendor') {
            if (response && response.user && response.user.id) {
              this.util.setItem('_uid', response.user.id);
              this.util.setItem('_authRole', response.user.role);
              this.util.setItem('_authEmail', response.user.email);
              this.util.setItem('_authFirstName', response.user.firstName);
              this.util.setItem('_authLastName', response.user.lastName);
              this.util.setItem('_authCoverImage', response.user.image);
              if (response && response.vendor && response.vendor.id && response.user.id == response.vendor.userId && response.user.role == 'vendor') {
                this.util.setItem('_vendorId', response.vendor.id);
                this.util.setItem('_vendorPOS', response.vendor.pos);
                this.util.setItem('_vendorOwnDriver', response.vendor.ownDriver);
                this.util.setItem('_vendorPromote', response.vendor.promote);
                this.util.setItem('_vendorCustomCategory', response.vendor.customCategory);
                this.util.setItem('_vendorMultiOutlet', response.vendor.multiOutlet);
                this.util.setItem('_vendorPreBooking', response.vendor.preBooking);
                this.util.setItem('_vendorTableOrder', response.vendor.tableOrder);
                this.util.setItem('_vendorTiffinSubscription', response.vendor.tiffinSubscription);
                this.util.setItem('_vendorOwnWaiter', response.vendor.ownWaiter);
                this.util.setItem('_vendorOwnKitchen', response.vendor.ownKitchen);
              } else if (response && response.vendor && response.vendor.id && response.user.id == response.vendor.userId && response.user.role == 'vendorOutlet' && response.manager && response.manager.id) {
                this.util.setItem('_vendorId', response.vendor.id);
                this.util.setItem('_vendorPOS', response.manager.pos);
                this.util.setItem('_vendorOwnDriver', response.manager.ownDriver);
                this.util.setItem('_vendorPromote', response.manager.promote);
                this.util.setItem('_vendorCustomCategory', response.manager.customCategory);
                this.util.setItem('_vendorMultiOutlet', response.manager.multiOutlet);
                this.util.setItem('_vendorPreBooking', response.manager.preBooking);
                this.util.setItem('_vendorTableOrder', response.manager.tableOrder);
                this.util.setItem('_vendorTiffinSubscription', response.manager.tiffinSubscription);
                this.util.setItem('_vendorOwnWaiter', response.manager.ownWaiter);
                this.util.setItem('_vendorOwnKitchen', response.manager.ownKitchen);
              }
              this.router.navigate(['/vendor']);
            } else {
              this.util.onError('ts_something_went_wrong', '');
            }
          }
        }, error: (error: any) => {
          console.log(error);
          if (error && error.error && error.error.message != '') {
            const extra = error && error.error && error.error.extra && error.error.extra != null && error.error.extra != '' ? error.error.extra : '';
            this.util.onError(error.error.message, extra);
          } else {
            this.util.onError('ts_something_went_wrong', '');
          }
          this.router.navigate(['/'], {
            replaceUrl: true,
            state: { flushed: true }
          });
        }
      });
    } catch (error) {
      console.log('catch error', error);
      this.util.onError('ts_something_went_wrong', '');
      this.router.navigate(['/'], {
        replaceUrl: true,
        state: { flushed: true }
      });
    }
  }

}
