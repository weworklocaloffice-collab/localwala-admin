import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UtilService } from '../services/util-service';
import { ApiService } from '../services/api-service';
import { lastValueFrom } from 'rxjs';

export const supportAuthGuard: CanActivateFn = async (route, state) => {
  const _authRole = localStorage.getItem('_authRole');
  const router = inject(Router);
  const utilService = inject(UtilService);
  const apiService = inject(ApiService);
  const _uid = utilService.getItem('_uid');
  if (_authRole && _authRole != null && _authRole != '' && _uid && _uid != '' && _uid != null) {
    // Both tiers enter through the same door; the server decides what each
    // role may touch. Hardcoding `supportTeam` here locked supervisors out
    // of the entire panel no matter what the API allowed.
    if (_authRole == 'supportTeam' || _authRole == 'supportSupervisor') {
      try {
        const profile = await lastValueFrom(apiService.get_private('v1/support_team/web_guard/' + _uid));
        console.log(profile);
        if (profile && profile.success && profile.success == true) {
          return true;
        }
        router.navigate(['/authentication/support']);
        return false;
      } catch (error) {
        console.error('Error in supportAuthGuard:', error);
        router.navigate(['/authentication/support']);
        return false;
      }
    }
    router.navigate(['/authentication/support']);
    return false;
  } else {
    router.navigate(['/authentication/support']);
    return false;
  }
};
