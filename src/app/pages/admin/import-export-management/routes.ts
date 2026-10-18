import { Routes } from '@angular/router';
import { ImportCollections } from './import-collections/import-collections';

export const ImportCollectionsManagmentRoutes: Routes = [
  {
    path: 'import-collection/:collection',
    component: ImportCollections,
    data: {
      title: 'import_collection'
    }
  },
];
