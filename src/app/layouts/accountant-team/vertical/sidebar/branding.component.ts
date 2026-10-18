import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { CoreService } from 'src/app/services/core.service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-accountant-team-branding',
  imports: [],
  template: `
    <a href="/accountant-team">
      <img
        [src]="api.mediaUrl+logo"
        class="align-middle m-2 sidebar-logo"
        alt="logo"
        width="180"
        height="40"
        onError="this.src='assets/images/logos/logo.png'"
      />
    </a>
  `,
})
export class AccountantTeamBrandingComponent {
  options = this.settings.getOptions();
  logo: string = '';
  constructor(private settings: CoreService, public util: UtilService, public api: ApiService) {
    this.logo = this.util.getItem('_brand_logo');
  }
}
