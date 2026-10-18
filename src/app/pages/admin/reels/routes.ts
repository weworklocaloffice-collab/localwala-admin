import { Routes } from '@angular/router';
import { ReelsList } from './reels-list/reels-list';
import { ReelForm } from './reel-form/reel-form';
import { ReelReports } from './reel-reports/reel-reports';

export const ReelsRoutes: Routes = [
  {
    path: 'reel-list',
    component: ReelsList,
    data: {
      title: 'reel_management'
    }
  },
  {
    path: 'reel-form',
    component: ReelForm,
    data: {
      title: 'create_reel'
    }
  },
  {
    path: 'reel-form/:id',
    component: ReelForm,
    data: {
      title: 'edit_reel'
    }
  },
  {
    path: 'reel-reports',
    component: ReelReports,
    data: {
      title: 'reel_reports'
    }
  },
];
