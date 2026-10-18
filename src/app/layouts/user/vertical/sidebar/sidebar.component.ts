import {
  Component,
  OnInit,
} from '@angular/core';
import { UserBrandingComponent } from './branding.component';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-user-sidebar',
  imports: [UserBrandingComponent, MaterialModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarUserComponent implements OnInit {
  constructor() { }

  ngOnInit(): void { }
}
