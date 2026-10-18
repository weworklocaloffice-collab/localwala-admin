import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api-service';
import { lastValueFrom } from 'rxjs';

export const setupGuard: CanActivateFn = async (route, state) => {
  console.log('setup auth guard');
  const apiService = inject(ApiService);
  const switchRoute: Router = inject(Router);
  try {
    const access = await lastValueFrom(apiService.get_public('v1/auth/installations'));
    console.log(access);
    if (access && access.isDone) {
      return true;
    }
    switchRoute.navigateByUrl('/authentication/register');
  } catch (error) {
    switchRoute.navigateByUrl('/authentication/error');
    return false;
  }
  return false;
};
