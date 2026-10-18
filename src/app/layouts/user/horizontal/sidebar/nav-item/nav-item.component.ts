import {
  Component,
  OnInit,
  Input,
} from '@angular/core';
import { Router } from '@angular/router';
import { NavService } from '../../../../../services/nav.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgIcon } from '@ng-icons/core';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-horizontal-user-nav-item',
  imports: [CommonModule, MatIconModule, NgIcon],
  templateUrl: './nav-item.component.html'
})
export class AppHorizontalUserNavItemComponent implements OnInit {
  @Input() depth: any;
  @Input() item: any;

  constructor(public navService: NavService, public router: Router, public util: UtilService) {
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }

  ngOnInit() { }
  onItemSelected(item: any) {
    if (!item.children || !item.children.length) {
      this.router.navigate([item.route]);
    }
  }
}
