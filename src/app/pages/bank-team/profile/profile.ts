import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Bank profile — the signed-in officer's bank + membership (plan §13.2).
 * Backed by GET /bank/me (token-resolved, no bank id in path).
 */
@Component({
  selector: 'app-bank-profile',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './profile.html',
})
export class Profile {
  isLoaded: boolean = false;
  bank: any = null;
  member: any = null;

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.api.get_private('v1/realestate/bank/me').subscribe({
      next: (response: any) => {
        this.bank = response.bank;
        this.member = response.member;
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }
}
