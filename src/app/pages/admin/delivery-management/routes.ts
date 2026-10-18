import { Routes } from '@angular/router';
import { Vehicle } from './vehicle/vehicle';
import { DeliveryShiftSchedule } from './delivery-shift-schedule/delivery-shift-schedule';
import { Drivers } from './drivers/drivers';
import { DeliverymanJoiningRequest } from './deliveryman-joining-request/deliveryman-joining-request';
import { DeliverymanWalletBonus } from './deliveryman-wallet-bonus/deliveryman-wallet-bonus';
import { ManageDriver } from './drivers/manage-driver/manage-driver';
import { DeliverymanJoiningRequestDetail } from './deliveryman-joining-request/deliveryman-joining-request-detail/deliveryman-joining-request-detail';
import { DriverDetails } from './drivers/driver-details/driver-details';

export const DeliveryManagementRoutes: Routes = [
  {
    path: 'vehicles',
    component: Vehicle,
    data: {
      title: 'vehicles_management'
    }
  },
  {
    path: 'delivery-shift-schedule',
    component: DeliveryShiftSchedule,
    data: {
      title: 'delivery_shift_schedule',
    }
  },
  {
    path: 'delivery-partners',
    component: Drivers,
    data: {
      title: 'delivery_partner_management'
    }
  },
  {
    path: 'add-driver',
    component: ManageDriver,
    data: {
      title: 'add_delivery_partner'
    }
  },
  {
    path: 'manage-driver/:id',
    component: ManageDriver,
    data: {
      title: 'update_delivery_partner'
    }
  },
  {
    path: 'deliveryman-joining-request',
    component: DeliverymanJoiningRequest,
    data: {
      title: 'deliveryman_joining_request'
    }
  },
  {
    path: 'deliveryman-joining-request-detail/:id',
    component: DeliverymanJoiningRequestDetail,
    data: {
      title: 'deliveryman_joining_request_detail'
    }
  },
  {
    path: 'wallet-add-fund',
    component: DeliverymanWalletBonus,
    data: {
      title: 'add_fund'
    }
  },
  {
    path: 'deliveryman-details/:id',
    component: DriverDetails,
    data: {
      title: 'deliveryman_details'
    }
  }
];
