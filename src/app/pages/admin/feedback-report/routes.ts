import { Routes } from '@angular/router';
import { FeedbackList } from './feedback-list/feedback-list';
import { ReportEmergencyList } from './report-emergency-list/report-emergency-list';

export const FeedbackManagmentRoutes: Routes = [
  {
    path: 'feedback-list',
    component: FeedbackList,
    data: {
      title: 'feedback_form'
    }
  },
  {
    path: 'report-emergency',
    component: ReportEmergencyList,
    data: {
      title: 'report_emergency_form'
    }
  },
];
