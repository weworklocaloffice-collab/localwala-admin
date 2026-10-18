import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CityMasterTeamBrandingComponent } from './branding.component';
import { NgIcon } from '@ng-icons/core';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-city-master-team-sidebar',
  imports: [
    CityMasterTeamBrandingComponent,
    NgIcon,
    MaterialModule
  ],
  templateUrl: './sidebar.component.html'
})
export class CityMasterTeamSidebarComponent implements OnInit {
  constructor() { }
  @Input() showToggle = true;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  ngOnInit(): void { }
}
