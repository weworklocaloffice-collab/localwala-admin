import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { MatButtonModule } from '@angular/material/button';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-error',
  imports: [RouterModule, MaterialModule, MatButtonModule],
  templateUrl: './error.component.html'
})
export class AppErrorComponent {

  constructor(public util: UtilService) { }

}
