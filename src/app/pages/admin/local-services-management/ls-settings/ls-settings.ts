import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-ls-settings',
  imports: [CommonModule, MaterialModule],
  templateUrl: './ls-settings.html',
})
export class LsSettings {
  isLoaded: boolean = true;
  settings: { key: string; value: string }[] = [
    { key: 'Default booking mode', value: 'SLOT' },
    { key: 'Default payment mode', value: 'gateway' },
    { key: 'Quote expiry (hours)', value: '48' },
    { key: 'Slot hold (minutes)', value: '15' },
  ];
}
