import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-media-storage-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './media-storage-settings.html',
})
export class MediaStorageSettings {

  action: string = 'add';
  id: string = '';
  settingForm = new FormGroup({
    name: new FormControl('local', [Validators.required]),
    imagePath: new FormControl(''),
    credentials: new FormGroup({
      gcsProjectId: new FormControl('', [Validators.required]),
      gcsBucketName: new FormControl('', [Validators.required]),
      azureConnectionString: new FormControl('', [Validators.required]),
      azureContainerName: new FormControl('', [Validators.required]),
      azureStorageAccountName: new FormControl('', [Validators.required]),
      awsRegionName: new FormControl('', [Validators.required]),
      awsAccessKey: new FormControl('', [Validators.required]),
      awsSecretKey: new FormControl('', [Validators.required]),
      awsBucketName: new FormControl('', [Validators.required]),
    }),
  });
  haveSubmitClicked: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {
    this.getList();
  }

  getList() {
    const spinnerRef = this.util.start();
    this.api.get_private('v1/admin/media_storage_setting/get').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.id) {
          this.id = response.id;
          this.action = 'edit';
          console.log('ID -->', this.id);
          const name = response && response.name && response.name != null && response.name != '' ? response.name : '';
          const imagePath = response && response.imagePath && response.imagePath != null && response.imagePath != '' ? response.imagePath : '';
          const creds = response.credentials;
          const gcsProjectId = creds && creds.gcsProjectId && creds.gcsProjectId != null && creds.gcsProjectId != '' ? creds.gcsProjectId : '';
          const gcsBucketName = creds && creds.gcsBucketName && creds.gcsBucketName != null && creds.gcsBucketName != '' ? creds.gcsBucketName : '';
          const azureConnectionString = creds && creds.azureConnectionString && creds.azureConnectionString != null && creds.azureConnectionString != '' ? creds.azureConnectionString : '';
          const azureContainerName = creds && creds.azureContainerName && creds.azureContainerName != null && creds.azureContainerName != '' ? creds.azureContainerName : '';
          const azureStorageAccountName = creds && creds.azureStorageAccountName && creds.azureStorageAccountName != null && creds.azureStorageAccountName != '' ? creds.azureStorageAccountName : '';

          const awsRegionName = creds && creds.awsRegionName && creds.awsRegionName != null && creds.awsRegionName != '' ? creds.awsRegionName : '';
          const awsAccessKey = creds && creds.awsAccessKey && creds.awsAccessKey != null && creds.awsAccessKey != '' ? creds.awsAccessKey : '';
          const awsSecretKey = creds && creds.awsSecretKey && creds.awsSecretKey != null && creds.awsSecretKey != '' ? creds.awsSecretKey : '';
          const awsBucketName = creds && creds.awsBucketName && creds.awsBucketName != null && creds.awsBucketName != '' ? creds.awsBucketName : '';

          this.settingForm.controls['name'].setValue(name);
          this.settingForm.controls['imagePath'].setValue(imagePath);
          this.settingForm.controls['credentials'].controls['gcsProjectId'].setValue(gcsProjectId);
          this.settingForm.controls['credentials'].controls['gcsBucketName'].setValue(gcsBucketName);

          this.settingForm.controls['credentials'].controls['azureConnectionString'].setValue(azureConnectionString);
          this.settingForm.controls['credentials'].controls['azureContainerName'].setValue(azureContainerName);
          this.settingForm.controls['credentials'].controls['azureStorageAccountName'].setValue(azureStorageAccountName);

          this.settingForm.controls['credentials'].controls['awsRegionName'].setValue(awsRegionName);
          this.settingForm.controls['credentials'].controls['awsAccessKey'].setValue(awsAccessKey);
          this.settingForm.controls['credentials'].controls['awsSecretKey'].setValue(awsSecretKey);
          this.settingForm.controls['credentials'].controls['awsBucketName'].setValue(awsBucketName);

          this.api.mediaUrl = imagePath;
        }

        this.onMethodCredForm();
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  get f() {
    return this.settingForm.controls;
  }

  get fCredentials() {
    return this.settingForm.controls['credentials'].controls;
  }

  onReset() {
    console.log('Reset');
    this.settingForm.patchValue({
      name: '',
      imagePath: '',
      credentials: {
        gcsProjectId: '',
        gcsBucketName: '',
        azureConnectionString: '',
        azureContainerName: '',
        azureStorageAccountName: '',
        awsRegionName: '',
        awsAccessKey: '',
        awsSecretKey: '',
        awsBucketName: ''
      }
    });
    this.haveSubmitClicked = false;
  }

  onSubmit() {
    console.log('on submit');
    console.log(this.settingForm);
    console.log(this.settingForm.getRawValue());
    this.haveSubmitClicked = true;
    if (this.settingForm.valid) {
      this.onImageFilePath();
      if (this.action == 'add') {
        this.onSave();
      } else {
        this.onUpdate();
      }
    }
  }

  onImageFilePath() {
    console.log('Image Path');
    const name: string = this.settingForm.controls['name'].value || 'local';
    if (name == 'local') {
      console.log('Local');
      this.settingForm.controls['imagePath'].setValue(`${this.api.baseUrl}storage/`);
    } else if (name == 'gcs') {
      console.log('Google');
      const bucketName = this.settingForm.controls['credentials'].controls['gcsBucketName'].value;
      this.settingForm.controls['imagePath'].setValue(`https://storage.googleapis.com/${bucketName}/`);
    } else if (name == 'azure') {
      console.log('Azure');
      const azureContainerName = this.settingForm.controls['credentials'].controls['azureContainerName'].value;
      const azureStorageAccountName = this.settingForm.controls['credentials'].controls['azureStorageAccountName'].value;
      this.settingForm.controls['imagePath'].setValue(`https://${azureStorageAccountName}.blob.core.windows.net/${azureContainerName}/`);
    } else if (name == 'aws_s3') {
      const bucketName = this.settingForm.controls['credentials'].controls['awsBucketName'].value;
      const regionName = this.settingForm.controls['credentials'].controls['awsRegionName'].value;
      this.settingForm.controls['imagePath'].setValue(`https://${bucketName}.s3.${regionName}.amazonaws.com/`);
    }

    this.api.mediaUrl = this.settingForm.controls['imagePath'].value ?? '';
  }

  onMethodCredForm() {
    console.log('Form Changed', this.settingForm.controls['name'].value);
    const name: string = this.settingForm.controls['name'].value || 'local';

    const gcsProjectId = this.settingForm.get('credentials.gcsProjectId');
    const gcsBucketName = this.settingForm.get('credentials.gcsBucketName');

    const azureConnectionString = this.settingForm.get('credentials.azureConnectionString');
    const azureContainerName = this.settingForm.get('credentials.azureContainerName');
    const azureStorageAccountName = this.settingForm.get('credentials.azureStorageAccountName');

    const awsRegionName = this.settingForm.get('credentials.awsRegionName');
    const awsAccessKey = this.settingForm.get('credentials.awsAccessKey');
    const awsSecretKey = this.settingForm.get('credentials.awsSecretKey');
    const awsBucketName = this.settingForm.get('credentials.awsBucketName');


    if (name == 'local') {
      console.log('Local');
      gcsProjectId?.clearValidators();
      gcsBucketName?.clearValidators();

      azureConnectionString?.clearValidators();
      azureContainerName?.clearValidators();
      azureStorageAccountName?.clearValidators();

      awsRegionName?.clearValidators();
      awsAccessKey?.clearValidators();
      awsSecretKey?.clearValidators();
      awsBucketName?.clearValidators();

    } else if (name == 'gcs') {
      console.log('Google');
      gcsProjectId?.setValidators([Validators.required]);
      gcsBucketName?.setValidators([Validators.required]);

      azureConnectionString?.clearValidators();
      azureContainerName?.clearValidators();
      azureStorageAccountName?.clearValidators();

      awsRegionName?.clearValidators();
      awsAccessKey?.clearValidators();
      awsSecretKey?.clearValidators();
      awsBucketName?.clearValidators();

    } else if (name == 'azure') {
      console.log('Azure');
      gcsProjectId?.clearValidators();
      gcsBucketName?.clearValidators();

      awsRegionName?.clearValidators();
      awsAccessKey?.clearValidators();
      awsSecretKey?.clearValidators();
      awsBucketName?.clearValidators();

      azureConnectionString?.setValidators([Validators.required]);
      azureContainerName?.setValidators([Validators.required]);
      azureStorageAccountName?.setValidators([Validators.required]);

    } else if (name == 'aws_s3') {
      console.log('AWS S3');
      gcsProjectId?.clearValidators();
      gcsBucketName?.clearValidators();

      azureConnectionString?.clearValidators();
      azureContainerName?.clearValidators();
      azureStorageAccountName?.clearValidators();

      awsRegionName?.setValidators([Validators.required]);
      awsAccessKey?.setValidators([Validators.required]);
      awsSecretKey?.setValidators([Validators.required]);
      awsBucketName?.setValidators([Validators.required]);
    }

    gcsProjectId?.updateValueAndValidity();
    gcsBucketName?.updateValueAndValidity();

    azureConnectionString?.updateValueAndValidity();
    azureContainerName?.updateValueAndValidity();
    azureStorageAccountName?.updateValueAndValidity();

    awsRegionName?.updateValueAndValidity();
    awsAccessKey?.updateValueAndValidity();
    awsSecretKey?.updateValueAndValidity();
    awsBucketName?.updateValueAndValidity();
    console.log(this.settingForm);
  }

  onMethodChanged(event: MatSelectChange) {
    console.log(event);
    this.onMethodCredForm();
  }

  onSave() {
    console.log('on save');
    console.log(this.settingForm.controls, this.settingForm.getRawValue());
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/admin/media_storage_setting/save', this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_setting_saved');
        if (response && response.id) {
          this.id = response.id;
          this.action = 'edit';
          window.location.reload();
        }
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onUpdate() {
    console.log('on update');
    console.log(this.settingForm.controls, this.settingForm.getRawValue());
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/admin/media_storage_setting/update/' + this.id, this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_setting_updated');
        window.location.reload();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

}
