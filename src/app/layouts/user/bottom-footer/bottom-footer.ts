import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-bottom-footer',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, RouterModule, NgIcon],
  templateUrl: './bottom-footer.html',
})
export class BottomFooter {

  currentYear: string = '';
  constructor(public util: UtilService, public api: ApiService) {
    this.currentYear = DateTime.now().setLocale(this.util.appLocaleName()).toFormat('yyyy');
  }

  logoUrl(): string {
    return this.api.mediaUrl + this.util.getItem('_brand_logo');
  }

  getHyperLink(name: string): string {
    const link = this.util.getItem(name);
    return link && link != null && link != '' && link != 'null' ? link : '#';
  }

  appName(): string {
    return this.util.getItem('_companyName');
  }

}
