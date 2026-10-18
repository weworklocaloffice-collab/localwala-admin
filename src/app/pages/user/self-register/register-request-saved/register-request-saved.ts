import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-register-request-saved',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './register-request-saved.html',
})
export class RegisterRequestSaved {

  constructor(public util: UtilService, public api: ApiService, private router: Router) { }

  onHome() {
    this.router.navigateByUrl('/', { replaceUrl: true });
  }
}
