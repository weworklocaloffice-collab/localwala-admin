import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-ls-permissions',
  imports: [CommonModule, MaterialModule],
  templateUrl: './ls-permissions.html',
})
export class LsPermissions {
  isLoaded: boolean = true;
  permissions: string[] = [
    'localservices_catalog_read',
    'localservices_catalog_write',
    'localservices_revenue_read',
    'localservices_revenue_write',
    'localservices_revenue_approve',
  ];
}
