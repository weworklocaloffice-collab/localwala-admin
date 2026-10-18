import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { MatButtonModule } from '@angular/material/button';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-maintenance',
  imports: [RouterModule, MaterialModule, MatButtonModule],
  templateUrl: './maintenance.component.html',
})
export class AppMaintenanceComponent {

  constructor(public util: UtilService) { }

}
