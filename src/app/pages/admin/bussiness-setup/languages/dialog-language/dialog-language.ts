import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { Observable, map, startWith } from 'rxjs';
import { LanguagesInterface } from 'src/app/interfaces/languages.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-language',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-language.html',
})
export class DialogLanguage {

  action: string = 'create';
  languagesList: Observable<LanguagesInterface[]>;
  listOfLanguages: LanguagesInterface[] = [];
  languageForm = new FormGroup({
    image: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    nativeName: new FormControl('', [Validators.required]),
    direction: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required]),
  });
  languageCtrl = new FormControl('');
  id: string = '';
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogLanguage>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(data);
    this.api.getLocalAssets('languages.json').then((response: any) => {
      if (response) {
        this.listOfLanguages = response;
        this.languagesList = this.languageCtrl.valueChanges.pipe(
          startWith(''),
          map((language) => (language ? this._filterArrayItems(language) : this.listOfLanguages.slice()))
        );
        if (data && data.action == 'edit') {
          this.action = data.action;
          const values = data.values;
          this.id = values.id;
          this.languageForm.controls['image'].setValue(values && values.image ? values.image : '');
          this.languageForm.controls['code'].setValue(values && values.code ? values.code : '');
          this.languageForm.controls['name'].setValue(values && values.name ? values.name : '');
          this.languageForm.controls['direction'].setValue(values && values.direction ? values.direction : '');
          this.languageForm.controls['nativeName'].setValue(values && values.nativeName ? values.nativeName : '');
        }
      }
    }).catch((error: any) => {
      console.log(error);
      this.util.onError('ts_something_went_wrong', '');
    });
  }

  private _filterArrayItems(value: string): LanguagesInterface[] {
    const filterValue = value.toLowerCase();

    return this.listOfLanguages.filter((state) =>
      state.name.toLowerCase().includes(filterValue)
    );
  }

  onSubmit() {
    console.log(this.languageForm);
    this.isFormSubmit = true;
    if (this.languageForm.valid) {
      if (this.action == 'create') {
        this.isSubmit = true;
        this.api.post_private('v1/admin/language/save', this.languageForm.value).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false;
            this.util.onSuccess('ts_language_added');
            this.dialogRef.close({ event: 'add', data: response });
          }, error: (error: any) => {
            console.log(error);
            this.isSubmit = false;
            this.util.handleError(error, 'admin');
          }
        });
      } else {
        console.log('update');
        this.isSubmit = true;
        this.api.patch_private('v1/admin/language/update/' + this.id, this.languageForm.value).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false;
            this.util.onSuccess('ts_language_updated');
            this.dialogRef.close({ event: 'update', data: response });
          }, error: (error: any) => {
            console.log(error);
            this.isSubmit = false;
            this.util.handleError(error, 'admin');
          }
        });
      }
    }
  }

  get f() {
    return this.languageForm.controls;
  }

  onLanguageSelect(event: any) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.languageForm.controls['name'].setValue(event.option.value);
      const selectedLanguage = this.listOfLanguages.filter(x => x.name == event.option.value);
      console.log(selectedLanguage);
      if (selectedLanguage && selectedLanguage.length) {
        this.languageForm.controls['code'].setValue(selectedLanguage[0].code);
        this.languageForm.controls['nativeName'].setValue(selectedLanguage[0].nativeName);
      }
    }
  }

  onImagePicker() {
    console.log('on image picker');
    const dialogRef = this.dialog.open(SelectMediaDialog, {
      data: { value: this.languageForm.controls['image'].value },
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
        this.languageForm.controls['image'].setValue(result.data);
      }
    });
  }

}
