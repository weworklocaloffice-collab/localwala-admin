import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { AccountantTeamBrandingComponent } from './branding.component';
import { NgIcon } from '@ng-icons/core';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-accountant-team-sidebar',
  imports: [
    AccountantTeamBrandingComponent,
    NgIcon,
    MaterialModule
  ],
  templateUrl: './sidebar.component.html'
})
export class AccountantTeamSidebarComponent implements OnInit {
  constructor() { }
  @Input() showToggle = true;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  ngOnInit(): void { }
}
