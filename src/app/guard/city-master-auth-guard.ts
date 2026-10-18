import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UtilService } from '../services/util-service';
import { ApiService } from '../services/api-service';
import { lastValueFrom } from 'rxjs';

export const cityMasterAuthGuard: CanActivateFn = async (route, state) => {
  const _authRole = localStorage.getItem('_authRole');
  const router = inject(Router);
  const utilService = inject(UtilService);
  const apiService = inject(ApiService);
  const _uid = utilService.getItem('_uid');
  if (_authRole && _authRole != null && _authRole != '' && _uid && _uid != '' && _uid != null) {
    if (_authRole == 'cityMaster') {
      try {
        const profile = await lastValueFrom(apiService.get_private('v1/cityzen/web_guard/' + _uid));
        console.log(profile);
        if (profile && profile.success && profile.success == true) {
          return true;
        }
        router.navigate(['/authentication/cityzen']);
        return false;
      } catch (error) {
        console.error('Error in cityMasterAuthGuard:', error);
        router.navigate(['/authentication/cityzen']);
        return false;
      }
    }
    router.navigate(['/authentication/cityzen']);
    return false;
  } else {
    router.navigate(['/authentication/cityzen']);
    return false;
  }
};
