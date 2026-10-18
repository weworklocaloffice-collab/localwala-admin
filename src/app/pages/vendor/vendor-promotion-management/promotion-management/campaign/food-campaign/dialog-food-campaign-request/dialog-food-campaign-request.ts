import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, map, startWith } from 'rxjs';
import { VendorFoodListLimitedInterface } from 'src/app/interfaces/vendor.foods.list.limited.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-dialog-food-campaign-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './dialog-food-campaign-request.html',
})
export class DialogFoodCampaignRequest {

  displayedColumn = ['name', 'price', 'discount', 'addons', 'variations', 'action'];
  id: string = '';
  title: string = '';
  savedFoods: string[] = [];
  foods: Observable<VendorFoodListLimitedInterface[]>;
  listOfFoods: VendorFoodListLimitedInterface[] = [];
  foodCtrl = new FormControl('');
  selectedFoodList: VendorFoodListLimitedInterface[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogFoodCampaignRequest>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.id && this.data.name) {
      this.id = this.data.id;
      this.title = this.data.name;
      this.savedFoods = this.data.foods;
      console.log(this.savedFoods);
      this.getList();
    } else {
      this.dialogRef.close({ event: 'close' });
    }
  }

  getList() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/food_campaign/getDetails/' + this.id + '/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        console.log(response);
        if (response && response.foods && response.foods) {
          const mappedList = response.foods.map(
            (item: VendorFoodListLimitedInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.listOfFoods = mappedList;
          this.foods = this.foodCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterFoods(element) : this.listOfFoods.slice()))
          );
          console.log(this.foods);
        }
        if (response && response.info && response.info.foods && response.info.foods instanceof Array && response.info.foods.length) {
          const list: VendorFoodListLimitedInterface[] = [];
          this.listOfFoods.forEach((element) => {
            response.info.foods.forEach((campaignFood: any) => {
              if (element.id == campaignFood.id) {
                list.push(campaignFood);
              }
            });
          });
          this.selectedFoodList = [...list];
          console.log('my foods', this.selectedFoodList);
        }

        const mappedList = this.selectedFoodList.map(
          (item: VendorFoodListLimitedInterface) => {
            if (item.translations) {
              const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
              item.displayName = translation?.title || item.name;
            } else {
              item.displayName = item?.name || '';
            }
            return item;
          }
        );
        this.selectedFoodList = mappedList;

      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  private _filterFoods(value: any): VendorFoodListLimitedInterface[] {
    console.log(value);
    let filterValue: string;
    if (value && value.displayName) {
      filterValue = value.displayName;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfFoods.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  onSelect() {
    this.dialogRef.close({ event: 'ok' });
  }

  onDelete(food: VendorFoodListLimitedInterface) {
    console.log(food);
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_removed_from_campaign_instruction', okTitle: 'ts_leave_campaign', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/vendor_web/food_campaign/leave/' + this.id + '/' + food.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.util.onSuccess('ts_removed_from_campaign');
            const newList = this.selectedFoodList.filter(x => x.id != food.id);
            this.selectedFoodList = [...newList];
            this.savedFoods = this.savedFoods.filter(x => x != food.id);
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'vendor');
          }
        });
      }
    });
  }

  getTranslatedFoodName(item: VendorFoodListLimitedInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.title) {
        return found.title;
      }
    }
    return item.name;
  }

  displayFoodName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfFoods.find(item => item.id == id);
    return selected ? this.getTranslatedFoodName(selected) : '';
  };

  onAddFoodToCampaign() {
    console.log('value', this.foodCtrl);
    let selectedFoodId: any = this.foodCtrl.value;
    console.log(selectedFoodId);
    if (selectedFoodId) {
      const spinnerRef = this.util.start('ts_saving');
      const param = {
        food: selectedFoodId,
        campaign: this.id,
        restaurant: this.util.getItem('_vendorId')
      };
      this.api.post_private('v1/vendor_web/food_campaign/join_request', param).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_request_sent');
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'vendor');
        }
      });
    }
    this.foodCtrl.setValue('');
  }

}
