import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ApiService } from '../services/api-service';

export const registerGuard: CanActivateFn = async (route, state) => {
  const apiSevice = inject(ApiService);
  const switchRoute: Router = inject(Router);
  try {
    const access = await lastValueFrom(apiSevice.get_public('v1/auth/installations'));
    console.log(access);
    if (access && access.isDone) {
      switchRoute.navigateByUrl('/authentication/error');
      return false;
    }
  } catch (error) {
    switchRoute.navigateByUrl('/authentication/error');
    return false;
  }
  return true;
};
