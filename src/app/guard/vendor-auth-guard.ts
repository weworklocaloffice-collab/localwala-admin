import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UtilService } from '../services/util-service';
import { ApiService } from '../services/api-service';
import { lastValueFrom } from 'rxjs';

export const vendorAuthGuard: CanActivateFn = async (route, state) => {
  const _authRole = localStorage.getItem('_authRole');
  const router = inject(Router);
  const utilService = inject(UtilService);
  const apiService = inject(ApiService);
  const _uid = utilService.getItem('_uid');
  console.log('vendor auth guard');
  if (_authRole && _authRole != null && _authRole != '' && _uid && _uid != '' && _uid != null) {
    if (_authRole == 'vendor' || _authRole == 'vendorOutlet') {
      try {
        const profile = await lastValueFrom(apiService.get_private('v1/vendor_web/getMyProfile/' + _uid));
        console.log(profile);
        if (profile && profile.restaurant && profile.restaurant.userId && profile.restaurant.userId == _uid) {
          if (profile.restaurant.isOutlet == false) {
            utilService.setItem('_vendorPOS', profile.restaurant.pos);
            utilService.setItem('_vendorOwnDriver', profile.restaurant.ownDriver);
            utilService.setItem('_vendorPromote', profile.restaurant.promote);
            utilService.setItem('_vendorCustomCategory', profile.restaurant.customCategory);
            utilService.setItem('_vendorMultiOutlet', profile.restaurant.multiOutlet);
            utilService.setItem('_vendorPreBooking', profile.restaurant.preBooking);
            utilService.setItem('_vendorTableOrder', profile.restaurant.tableOrder);
            utilService.setItem('_vendorTiffinSubscription', profile.restaurant.tiffinSubscription);
            utilService.setItem('_vendorOwnWaiter', profile.restaurant.ownWaiter);
            utilService.setItem('_vendorOwnKitchen', profile.restaurant.ownKitchen);
          } else if (profile.restaurant.isOutlet == true && profile.manager) {
            utilService.setItem('_vendorPOS', profile.manager.pos);
            utilService.setItem('_vendorOwnDriver', profile.manager.ownDriver);
            utilService.setItem('_vendorPromote', profile.manager.promote);
            utilService.setItem('_vendorCustomCategory', profile.manager.customCategory);
            utilService.setItem('_vendorMultiOutlet', profile.manager.multiOutlet);
            utilService.setItem('_vendorPreBooking', profile.manager.preBooking);
            utilService.setItem('_vendorTableOrder', profile.manager.tableOrder);
            utilService.setItem('_vendorTiffinSubscription', profile.manager.tiffinSubscription);
            utilService.setItem('_vendorOwnWaiter', profile.manager.ownWaiter);
            utilService.setItem('_vendorOwnKitchen', profile.manager.ownKitchen);
          }
          return true;
        }
        utilService.onError('ts_something_went_wrong', '');
        router.navigate(['/authentication/vendor']);
        return false;
      } catch (error) {
        console.error('Error in vendorAuthGuard:', error);
        router.navigate(['/authentication/vendor']);
        return false;
      }
    }
    router.navigate(['/authentication/vendor']);
    return false;
  } else {
    router.navigate(['/authentication/vendor']);
    return false;
  }
};
