import { Routes } from '@angular/router';
import { ImportExport } from './import-export';

export const StoresImportExportRoutes: Routes = [
  {
    path: 'import-export/:collection',
    component: ImportExport,
    data: {
      title: 'stores_import_export'
    }
  },
];