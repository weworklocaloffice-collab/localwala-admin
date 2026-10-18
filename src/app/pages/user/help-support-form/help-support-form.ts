import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, startWith, map } from 'rxjs';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-help-support-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './help-support-form.html',
})
export class HelpSupportForm {

  form = new FormGroup({
    userEmail: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])),
    userName: new FormControl('', [Validators.required]),
    userCountryCode: new FormControl('', [Validators.required]),
    userContact: new FormControl('', [Validators.required]),
    shortDescription: new FormControl('', [Validators.required]),
  });
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();

  description: string = '';
  isLoaded: boolean = false;

  safeDescription!: SafeHtml;

  constructor(public api: ApiService, public util: UtilService, private sanitizer: DomSanitizer) {
    this.form.controls['userCountryCode'].setValue(this.api.defaultCountryCode);
    this.getCountryCodes();
    this.getPageContent();
  }

  getPageContent() {
    this.isLoaded = false;
    this.api.get_public('v1/public/app_pages/content/help').subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(response);
        if (response && response.description && response.description != null && response.description != '') {
          this.description = this.util.htmlDecode(response.description);
          if (response?.translations) {
            const translation = response.translations.find((t: any) => t.code == this.util.appLocaleName());
            this.description = this.util.htmlDecode(translation?.value) || this.util.htmlDecode(response.description);
          }
          this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(this.description);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'public');
      }
    });
  }

  getCountryCodes() {
    this.api.getLocalAssets('countryCodes.json').then((response: any) => {
      if (response) {
        this.listOfCountryCodes = response;
        this.countryCodes = this.countryCodeCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this._filterCountryCode(element) : this.listOfCountryCodes.slice()))
        );
        const defaultCountryCode = this.listOfCountryCodes.filter(x => x.dial_code == this.api.defaultCountryCode);
        console.log(defaultCountryCode);
        this.countryCodeCtrl.setValue(defaultCountryCode[0].flag + ' ' + defaultCountryCode[0].dial_code + ' ' + defaultCountryCode[0].name);
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

  get f() {
    return this.form.controls;
  }

  onCountryCodeSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      const splitString = event.option.value.split(' ');
      console.log(splitString);
      if (splitString && splitString instanceof Array && splitString.length) {
        this.form.controls['userCountryCode'].setValue(splitString[1]);
      }
    }
  }

  onSubmit() {
    console.log('submit');
    console.log(this.form);
    this.isFormSubmit = true;
    if (this.form.valid) {
      this.isSubmit = true;
      this.api.post_public('v1/public/feedback_form/save/', this.form.getRawValue()).subscribe({
        next: (response: any) => {
          console.log(response);
          this.isSubmit = false
          this.util.onSuccess('ts_feedback_saved');
          this.form.patchValue({
            userEmail: '',
            userName: '',
            userCountryCode: '',
            userContact: '',
            shortDescription: ''
          });
          this.getCountryCodes();
          this.isFormSubmit = false;
          this.isSubmit = false;
        }, error: (error: any) => {
          this.isSubmit = false;
          this.util.handleError(error, 'public');
        }
      });
    }
  }

  getHyperLink(name: string): string {
    const link = this.util.getItem(name);
    return link && link != null && link != '' && link != 'null' ? link : '#';
  }

  getContactEmail(): string {
    return this.util.getItem('_contactEmail');
  }

  getContactNumber(): string {
    return `${this.util.getItem('_contactCountryCode')} ${this.util.getItem('_contactMobile')}`;
  }

  getContactAddress(): string {
    return this.util.getItem('_contactAddress');
  }

}
