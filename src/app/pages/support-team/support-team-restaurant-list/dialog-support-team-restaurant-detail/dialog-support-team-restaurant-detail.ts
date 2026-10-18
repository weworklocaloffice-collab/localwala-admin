import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-support-team-restaurant-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-support-team-restaurant-detail.html',
})
export class DialogSupportTeamRestaurantDetail {

  id: string = '';
  restaurantName: string = '';
  restaurantAddress: string = '';
  ownerName: string = '';
  email: string = '';
  mobile: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogSupportTeamRestaurantDetail>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.id && this.data.id != '') {
      this.id = this.data.id;
      this.getDetail();
    }
  }

  getDetail() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/support_team/restaurant_detail/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        const restaurant = response.restaurant;
        this.restaurantName = restaurant.name;
        this.restaurantAddress = restaurant.address;
        const user = response.user;
        this.ownerName = `${user.firstName} ${user.lastName}`;
        this.email = user.email;
        this.mobile = `+${user.countryCode} ${user.mobile}`

        if (response && response.restaurant && response.restaurant.translations && Array.isArray(response.restaurant.translations)) {
          if (response.restaurant.translations) {
            const translation = response.restaurant.translations.find((t: any) => t.code == this.util.appLocaleName());
            this.restaurantName = translation?.title || response.restaurant.name;
            this.restaurantAddress = translation?.address || response.restaurant.address;
          }
        }

      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'support-team');
      }
    });
  }

}
