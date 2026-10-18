import { Routes } from '@angular/router';
import { MediaList } from './media-list/media-list';

export const MediaRoutes: Routes = [
  {
    path: '',
    component: MediaList,
    data: {
      title: 'media_management',
    },
  },
];
