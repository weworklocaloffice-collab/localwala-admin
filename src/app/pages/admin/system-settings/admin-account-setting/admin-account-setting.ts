import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map, startWith } from 'rxjs';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-admin-account-setting',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './admin-account-setting.html',
})
export class AdminAccountSetting {

  form = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    mobile: new FormControl('', [Validators.required]),
  });
  passwordForm = new FormGroup({
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, { validators: this.passwordMatchValidator })
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();
  haveSubmitClicked: boolean = false;
  havePasswordSubmitClicked: boolean = false;
  showPassword: boolean = true;
  showConfirmPassword: boolean = true;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.getCountryCodes();
    this.getDetail();
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  getCountryCodes() {
    this.api.getLocalAssets('countryCodes.json').then((response: any) => {
      if (response) {
        this.listOfCountryCodes = response;
        this.countryCodes = this.countryCodeCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this._filterCountryCode(element) : this.listOfCountryCodes.slice()))
        );

      }
    }).catch((error: any) => {
      console.log(error);
      this.util.onError('ts_something_went_wrong', '');
    });
  }

  private _filterCountryCode(value: string): CountryCodeInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCountryCodes.filter((element) =>
      element.name.toLowerCase().includes(filterValue)
    );
  }

  getDetail() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/admin_profile/' + this.util.getItem('_uid')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success && response.user) {
          const user = response.user;
          this.form.controls['email'].setValue(user.email);
          this.form.controls['firstName'].setValue(user.firstName);
          this.form.controls['lastName'].setValue(user.lastName);
          this.form.controls['image'].setValue(user.image);
          this.form.controls['countryCode'].setValue(`+${user.countryCode}`, { emitEvent: false });
          this.form.controls['mobile'].setValue(user.mobile);
          const selectedCountryCode = this.listOfCountryCodes.filter(x => x.dial_code == `+${user.countryCode}`);
          if (selectedCountryCode && selectedCountryCode.length) {
            this.countryCodeCtrl.setValue(selectedCountryCode[0].flag + ' ' + selectedCountryCode[0].dial_code + ' ' + selectedCountryCode[0].name);
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  get pForm() {
    return this.passwordForm.controls;
  }

  onImageClick() {
    const dialogRef = this.dialog.open(SelectMediaDialog, {
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
      if (result && result.event && result.event == 'select' && result.data && result.data != '') {
        this.form.controls['image'].setValue(result.data);
      }
    });
  }

  onCountryCodeSelect(event: MatAutocompleteSelectedEvent) {
    if (event && event.option && event.option.value) {
      const splitString = event.option.value.split(' ');
      if (splitString && splitString instanceof Array && splitString.length) {
        this.form.controls['countryCode'].setValue(splitString[1]);
      }
    }
  }

  onSaveDetail() {
    console.log('On Save Detail');
    this.haveSubmitClicked = true;
    console.log(this.form.getRawValue());
    if (this.form.valid) {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        data: { title: 'ts_reauth_required', subTitle: 'ts_accountant_security_instruction', okTitle: 'ts_yes_update', closeTitle: 'ts_cancel' },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
        if (result && result.action && result.action == "confirm") {
          console.log('confirmed');
          const spinnerRef = this.util.start('ts_updating');
          this.api.patch_private('v1/admin/update_admin/' + this.util.getItem('_uid'), this.form.getRawValue()).subscribe({
            next: (response: any) => {
              console.log(response);
              this.util.stop(spinnerRef);
              if (response && response.success) {
                if (response.reload == true) {
                  this.api.post_public('v1/auth/logout_web', {}).subscribe({
                    next: (response: any) => {
                      console.log(response);
                      this.util.clearItem();
                      this.router.navigate(['/authentication/admin']);
                    }, error: (error: any) => {
                      console.log(error);
                      this.util.clearItem();
                      this.router.navigate(['/authentication/admin']);
                    }
                  });
                }
              }
            }, error: (error: any) => {
              this.util.stop(spinnerRef);
              this.util.handleError(error, 'admin');
            }
          });
        }
      });
    }
  }

  onUpdatePassword() {
    console.log('update password');
    console.log(this.passwordForm);
    this.havePasswordSubmitClicked = true;
    if (this.passwordForm.valid) {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        data: { title: 'ts_reauth_required', subTitle: 'ts_accountant_security_logout', okTitle: 'ts_yes_update', closeTitle: 'ts_cancel' },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
        if (result && result.action && result.action == "confirm") {
          console.log('confirmed');
          const spinnerRef = this.util.start('ts_updating');
          this.api.patch_private('v1/admin/update_admin_password/' + this.util.getItem('_uid'), { "password": this.passwordForm.controls['password'].value }).subscribe({
            next: (response: any) => {
              console.log(response);
              this.util.stop(spinnerRef);
              this.api.post_public('v1/auth/logout_web', {}).subscribe({
                next: (response: any) => {
                  console.log(response);
                  this.util.clearItem();
                  this.router.navigate(['/authentication/admin']);
                }, error: (error: any) => {
                  console.log(error);
                  this.util.clearItem();
                  this.router.navigate(['/authentication/admin']);
                }
              });
            }, error: (error: any) => {
              this.util.stop(spinnerRef);
              this.util.handleError(error, 'admin');
            }
          });
        }
      });
    }
  }

}
