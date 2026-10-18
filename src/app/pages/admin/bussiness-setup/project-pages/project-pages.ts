import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ProjectPageForm } from "./project-page-form/project-page-form";

@Component({
  selector: 'app-project-pages',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, ProjectPageForm],
  templateUrl: './project-pages.html',
})
export class ProjectPages {

  tabIndex: number = 0;
  about: string = 'about-us';
  privacy: string = 'privacy-policy';
  terms: string = 'terms-and-conditions';
  refund: string = 'refund-policy';
  shipping: string = 'shipping-policy';
  cancellation: string = 'cancellation-policy';
  cookies: string = 'cookies';
  help: string = 'help';
  faqs: string = 'frequently-asked-questions';
  diningFaqs: string = 'dining-frequently-asked-questions';

  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {

  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    console.log('tabChangeEvent => ', tabChangeEvent);
    console.log('index => ', tabChangeEvent.index);
    this.tabIndex = tabChangeEvent.index;
  }

}
