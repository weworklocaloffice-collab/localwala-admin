import { Routes } from '@angular/router';
import { JhatkaSettings } from './jhatka-settings/jhatka-settings';
import { Settings } from './settings/settings';
import { Subscriptions } from './subscriptions/subscriptions';
import { ProjectPages } from './project-pages/project-pages';
import { CronJobScheduler } from './cron-job-scheduler/cron-job-scheduler';
import { RealEstateSettings } from './real-estate-settings/real-estate-settings';
import { JoiningPageSetup } from './joining-page-setup/joining-page-setup';
import { ManageSubscription } from './subscriptions/manage-subscription/manage-subscription';
import { SubscribersList } from './subscriptions/subscribers-list/subscribers-list';

export const BusinessSetupRoutes: Routes = [
  {
    path: '',
    component: Settings,
    data: {
      title: 'business_setup',
    },
  },
  {
    path: 'subscriptions',
    component: Subscriptions,
    data: {
      title: 'subscriptions_management'
    }
  },
  {
    path: 'manage-subscription/:action/:id',
    component: ManageSubscription,
    data: {
      title: 'manage_subscriptions'
    }
  },
  {
    path: 'subscribers-list',
    component: SubscribersList,
    data: {
      title: 'subscribers_list'
    }
  },
  {
    path: 'pages',
    component: ProjectPages,
    data: {
      title: 'project_pages',
    }
  },
  {
    path: 'cron-job-scheduler',
    component: CronJobScheduler,
    data: {
      title: 'cron_job_scheduler'
    }
  },
  {
    path: 'joining-form-setup',
    component: JoiningPageSetup,
    data: {
      title: 'joining_form_setup'
    }
  },
  {
    path: 'real-estate-settings',
    component: RealEstateSettings,
    data: {
      title: 'realEstate_settings'
    }
  },
  {
    path: 'jhatka-settings',
    component: JhatkaSettings,
    data: {
      title: 'jhatka_settings'
    }
  }
];
