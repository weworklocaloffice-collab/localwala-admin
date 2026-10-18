import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CityzenMediaImagesDialog } from 'src/app/pages/city-master-team/cityzen-media-images-dialog/cityzen-media-images-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-cityzen-restaurant-waiter',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-cityzen-restaurant-waiter.html',
})
export class DialogCityzenRestaurantWaiter {

  id: string = '';
  userId: string = '';
  haveSubmitClicked: boolean = false;
  waiterForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    gender: new FormControl('male', [Validators.required]),
  });

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private location: Location
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id) {
      this.getInfo();
    }
  }

  getInfo() {
    console.log('get info');
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/waiter_detail/' + this.id).subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        console.log(response);
        if (response && response.info && response.info.id) {
          const info = response.info;
          console.log(info);
          this.userId = info.id;
          this.waiterForm.controls['firstName'].setValue(info.firstName);
          this.waiterForm.controls['lastName'].setValue(info.lastName);
          this.waiterForm.controls['gender'].setValue(info.gender);
          this.waiterForm.controls['image'].setValue(info.image);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  get f() {
    return this.waiterForm.controls;
  }


  onImageClick(formName: string) {
    console.log('on image click for ', formName);
    const dialogRef = this.dialog.open(CityzenMediaImagesDialog, {
      data: { value: '' },
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      height: "calc(100% - 30px)",
      width: "calc(100% - 30px)",
      maxWidth: "100%",
      maxHeight: "100%",
      panelClass: 'full-width-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event && result.event == 'select' && result.data && result.data != '') {
        this.waiterForm.controls['image'].setValue(result.data);
      }
    });
  }

  onSubmit() {
    console.log(this.waiterForm);
    const sendData = this.waiterForm.getRawValue();
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/cityzen/update_waiter_detail/' + this.userId, sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_waiter_updated');
        this.location.back();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onReset() {
    console.log('Reset');
    this.waiterForm.patchValue({
      firstName: '',
      lastName: '',
      image: '',
      gender: 'male'
    });
    this.haveSubmitClicked = false;
    console.log(this.waiterForm.getRawValue());
  }

}
