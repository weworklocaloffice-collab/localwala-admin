import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { UtilService } from '../services/util-service';
import { ApiService } from '../services/api-service';

export const bankAuthGuard: CanActivateFn = async (route, state) => {
  const _authRole = localStorage.getItem('_authRole');
  const router = inject(Router);
  const utilService = inject(UtilService);
  const apiService = inject(ApiService);
  const _uid = utilService.getItem('_uid');
  if (_authRole && _authRole != null && _authRole != '' && _uid && _uid != '' && _uid != null) {
    if (_authRole == 'bank') {
      try {
        // A live membership check: /auth/bank/login sets the role, but
        // the portal only opens if the backend still sees an ACTIVE
        // RealEstateBankMember for this user.
        const profile = await lastValueFrom(apiService.get_private('v1/realestate/bank/applications'));
        return true;
      } catch (error) {
        console.error('Error in bankAuthGuard:', error);
        router.navigate(['/authentication/bank']);
        return false;
      }
    }
    router.navigate(['/authentication/bank']);
    return false;
  } else {
    router.navigate(['/authentication/bank']);
    return false;
  }
};
