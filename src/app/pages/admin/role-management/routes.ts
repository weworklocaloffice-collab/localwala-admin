import { Routes } from '@angular/router';
import { AdminRolesList } from './admin-roles-list/admin-roles-list';
import { AccountantTeamRolesList } from './accountant-team-roles-list/accountant-team-roles-list';
import { CityMasterTeamRolesList } from './city-master-team-roles-list/city-master-team-roles-list';
import { SupportTeamRolesList } from './support-team-roles-list/support-team-roles-list';

export const RoleManagementRoutes: Routes = [
  {
    path: 'admin-team-list',
    component: AdminRolesList,
    data: {
      title: 'admin_team'
    }
  },
  {
    path: 'accountant-team-list',
    component: AccountantTeamRolesList,
    data: {
      title: 'accountant_team'
    }
  },
  {
    path: 'cityzen-team-list',
    component: CityMasterTeamRolesList,
    data: {
      title: 'cityzen_team'
    }
  },
  {
    path: 'support-team-list',
    component: SupportTeamRolesList,
    data: {
      title: 'support_team'
    }
  }
];
