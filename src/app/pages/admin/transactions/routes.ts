import { Routes } from '@angular/router';
import { CollectCash } from './collect-cash/collect-cash';
import { RestaurantWithdraws } from './restaurant-withdraws/restaurant-withdraws';
import { DeliverymanWithdraws } from './deliveryman-withdraws/deliveryman-withdraws';
import { WithdrawalMethods } from './withdrawal-methods/withdrawal-methods';
import { ManageWithdrawalMethods } from './withdrawal-methods/manage-withdrawal-methods/manage-withdrawal-methods';
import { WithdrawalRequestDetail } from './withdrawal-request-detail/withdrawal-request-detail';
import { RestaurantDisbursements } from './restaurant-disbursements/restaurant-disbursements';
import { RestaurantDisbursementList } from './restaurant-disbursements/restaurant-disbursement-list/restaurant-disbursement-list';
import { DeliverymanDisbursements } from './deliveryman-disbursements/deliveryman-disbursements';
import { DeliverymanDisbursementList } from './deliveryman-disbursements/deliveryman-disbursement-list/deliveryman-disbursement-list';

export const TransactionRoutes: Routes = [
  {
    path: 'collection-cash',
    component: CollectCash,
    data: {
      title: 'collect_cash'
    }
  },
  {
    path: 'restaurant-withdraws',
    component: RestaurantWithdraws,
    data: {
      title: 'restaurant_withdraws'
    }
  },
  {
    path: 'deliveryman-withdraws',
    component: DeliverymanWithdraws,
    data: {
      title: 'deliveryman_withdraws'
    }
  },
  {
    path: 'withdrawal-methods',
    component: WithdrawalMethods,
    data: {
      title: 'withdrawal_methods'
    }
  },
  {
    path: 'add-withdrawal-method',
    component: ManageWithdrawalMethods,
    data: {
      title: 'add_withdrawal_method'
    }
  },
  {
    path: 'update-withdrawal-method/:id',
    component: ManageWithdrawalMethods,
    data: {
      title: 'update_withdrawal_method'
    }
  },
  {
    path: 'withdrawal-request-detail/:id',
    component: WithdrawalRequestDetail,
    data: {
      title: 'withdrawal_request_detail'
    }
  },
  {
    path: 'restaurant-disbursements',
    component: RestaurantDisbursements,
    data: {
      title: 'restaurant_disbursement',
    }
  },
  {
    path: 'restaurant-disbursement-list/:id',
    component: RestaurantDisbursementList,
    data: {
      title: 'restaurant_disbursement_list',
    }
  },
  {
    path: 'deliveryman-disbursements',
    component: DeliverymanDisbursements,
    data: {
      title: 'deliveryman_disbursement'
    }
  },
  {
    path: 'deliveryman-disbursement-list/:id',
    component: DeliverymanDisbursementList,
    data: {
      title: 'deliveryman_disbursement_list'
    }
  }
];
