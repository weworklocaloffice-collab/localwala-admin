import { Routes } from '@angular/router';
import { AccountantTeamDashboard } from './accountant-team-dashboard/accountant-team-dashboard';
import { AccountantCollectCash } from './accountant-collect-cash/accountant-collect-cash';
import { AccountantRestaurantWithdrawalRequest } from './accountant-restaurant-withdrawal-request/accountant-restaurant-withdrawal-request';
import { AccountantDeliverymanWithdrawalRequest } from './accountant-deliveryman-withdrawal-request/accountant-deliveryman-withdrawal-request';
import { AccountantWithdrawalRequestDetail } from './accountant-withdrawal-request-detail/accountant-withdrawal-request-detail';
import { AccountantRestaurantDisbursementList } from './accountant-restaurant-disbursement-list/accountant-restaurant-disbursement-list';
import { AccountantDeliverymanDisbursementList } from './accountant-deliveryman-disbursement-list/accountant-deliveryman-disbursement-list';
import { AccountantWithdrawalMethodList } from './accountant-withdrawal-method-list/accountant-withdrawal-method-list';
import { AccountantCustomerReport } from './accountant-customer-report/accountant-customer-report';
import { AccountantDeliverymanDisbursementReport } from './accountant-deliveryman-disbursement-report/accountant-deliveryman-disbursement-report';
import { AccountantDeliverymanReport } from './accountant-deliveryman-report/accountant-deliveryman-report';
import { AccountantDiningBookingReport } from './accountant-dining-booking-report/accountant-dining-booking-report';
import { AccountantFoodReport } from './accountant-food-report/accountant-food-report';
import { AccountantPosOrderReport } from './accountant-order-report/accountant-pos-order-report/accountant-pos-order-report';
import { AccountantRegularOrderReport } from './accountant-order-report/accountant-regular-order-report/accountant-regular-order-report';
import { AccountantTableOrderReport } from './accountant-order-report/accountant-table-order-report/accountant-table-order-report';
import { AccountantPaymentTransactionReport } from './accountant-payment-transaction-report/accountant-payment-transaction-report';
import { AccountantRestaurantDisbursementReport } from './accountant-restaurant-disbursement-report/accountant-restaurant-disbursement-report';
import { AccountantRestaurantReport } from './accountant-restaurant-report/accountant-restaurant-report';
import { AccountantTeamExpenseReport } from './accountant-team-expense-report/accountant-team-expense-report';
import { AccountantWalletTransactionReport } from './accountant-wallet-transaction-report/accountant-wallet-transaction-report';
import { AccountantOrderDetail } from './accountant-order-detail/accountant-order-detail';
import { AccountantCustomerDetail } from './accountant-customer-detail/accountant-customer-detail';
import { AccountantRestaurantDetail } from './accountant-restaurant-detail/accountant-restaurant-detail';
import { AccountantPosOrderDetail } from './accountant-pos-order-detail/accountant-pos-order-detail';
import { AccountantTableOrderDetail } from './accountant-table-order-detail/accountant-table-order-detail';
import { AccountantDeliverymanDetail } from './accountant-deliveryman-detail/accountant-deliveryman-detail';
import { AccountantDiningBookingDetail } from './accountant-dining-booking-detail/accountant-dining-booking-detail';
import { AccountantTiffinPackagePurchaseDetail } from './accountant-tiffin-package-purchase-detail/accountant-tiffin-package-purchase-detail';
import { AccountantProfileSetting } from './accountant-profile-setting/accountant-profile-setting';
import { AccountantDeliverymanDibursementReportList } from './accountant-deliveryman-disbursement-list/accountant-deliveryman-dibursement-report-list/accountant-deliveryman-dibursement-report-list';
import { AccountantRestaurantDisbursementReportList } from './accountant-restaurant-disbursement-list/accountant-restaurant-disbursement-report-list/accountant-restaurant-disbursement-report-list';
import { AccountantManageWithdrawalMethod } from './accountant-withdrawal-method-list/accountant-manage-withdrawal-method/accountant-manage-withdrawal-method';

export const AccountantManagementRoutes: Routes = [
  {
    path: '',
    component: AccountantTeamDashboard,
    data: {
      title: 'dashboard'
    }
  },
  {
    path: 'collect-cash',
    component: AccountantCollectCash,
    data: {
      title: 'collect_cash'
    }
  },
  {
    path: 'restaurant-withdrawal-request',
    component: AccountantRestaurantWithdrawalRequest,
    data: {
      title: 'restaurant_withdrawal_request'
    }
  },
  {
    path: 'deliveryman-withdrawal-request',
    component: AccountantDeliverymanWithdrawalRequest,
    data: {
      title: 'deliveryman_withdrawal_request'
    }
  },
  {
    path: 'withdrawal-request-detail/:id',
    component: AccountantWithdrawalRequestDetail,
    data: {
      title: 'withdrawal_request_detail'
    }
  },
  {
    path: 'restaurant-disbursement-list',
    component: AccountantRestaurantDisbursementList,
    data: {
      title: 'restaurant_disbursement_list'
    }
  },
  {
    path: 'restaurant-disbursement-report-list/:id',
    component: AccountantRestaurantDisbursementReportList,
    data: {
      title: 'restaurant_disbursement_list'
    }
  },
  {
    path: 'deliveryman-disbursement-list',
    component: AccountantDeliverymanDisbursementList,
    data: {
      title: 'deliveryman_disbursement_list'
    }
  },
  {
    path: 'deliveryman-disbursement-report-list/:id',
    component: AccountantDeliverymanDibursementReportList,
    data: {
      title: 'deliveryman_disbursement_list'
    }
  },
  {
    path: 'withdrawal-methods',
    component: AccountantWithdrawalMethodList,
    data: {
      title: 'withdrawal_methods'
    }
  },
  {
    path: 'add-withdrawal-method',
    component: AccountantManageWithdrawalMethod,
    data: {
      title: 'add_withdrawal_method'
    }
  },
  {
    path: 'update-withdrawal-method/:id',
    component: AccountantManageWithdrawalMethod,
    data: {
      title: 'update_withdrawal_method'
    }
  },
  {
    path: 'customer-report',
    component: AccountantCustomerReport,
    data: {
      title: 'customer_report'
    }
  },
  {
    path: 'deliveryman-disbursement-report',
    component: AccountantDeliverymanDisbursementReport,
    data: {
      title: 'deliveryman_disbursement_report'
    }
  },
  {
    path: 'deliveryman-report',
    component: AccountantDeliverymanReport,
    data: {
      title: 'deliveryman_report'
    }
  },
  {
    path: 'dining-booking-report',
    component: AccountantDiningBookingReport,
    data: {
      title: 'dining_booking_report'
    }
  },
  {
    path: 'food-report',
    component: AccountantFoodReport,
    data: {
      title: 'food_report'
    }
  },
  {
    path: 'pos-order-report',
    component: AccountantPosOrderReport,
    data: {
      title: 'pos_order_report'
    }
  },
  {
    path: 'regular-order-report',
    component: AccountantRegularOrderReport,
    data: {
      title: 'regular_order_report'
    }
  },
  {
    path: 'table-order-report',
    component: AccountantTableOrderReport,
    data: {
      title: 'table_order_report'
    }
  },
  {
    path: 'payment-transaction-report',
    component: AccountantPaymentTransactionReport,
    data: {
      title: 'payment_transaction_report'
    }
  },
  {
    path: 'restaurant-disbursement-report',
    component: AccountantRestaurantDisbursementReport,
    data: {
      title: 'restaurant_disbursement_report'
    }
  },
  {
    path: 'restaurant-report',
    component: AccountantRestaurantReport,
    data: {
      title: 'restaurant_report'
    }
  },
  {
    path: 'expense-report',
    component: AccountantTeamExpenseReport,
    data: {
      title: 'expense_report'
    }
  },
  {
    path: 'wallet-transaction',
    component: AccountantWalletTransactionReport,
    data: {
      title: 'wallet_transaction'
    }
  },
  {
    path: 'order-detail/:id',
    component: AccountantOrderDetail,
    data: {
      title: 'order_detail'
    }
  },
  {
    path: 'customer-detail/:id',
    component: AccountantCustomerDetail,
    data: {
      title: 'customer_detail'
    }
  },
  {
    path: 'restaurant-detail/:id',
    component: AccountantRestaurantDetail,
    data: {
      title: 'restaurant_detail'
    }
  },
  {
    path: 'pos-order-detail/:id',
    component: AccountantPosOrderDetail,
    data: {
      title: 'pos_order_detail'
    }
  },
  {
    path: 'table-order-detail/:id',
    component: AccountantTableOrderDetail,
    data: {
      title: 'table_order_detail'
    }
  },
  {
    path: 'deliveryman-detail/:id',
    component: AccountantDeliverymanDetail,
    data: {
      title: 'deliveryman_detail'
    }
  },
  {
    path: 'dining-booking-detail/:id',
    component: AccountantDiningBookingDetail,
    data: {
      title: 'dining_booking_detail'
    }
  },
  {
    path: 'purchased-package-detail/:id',
    component: AccountantTiffinPackagePurchaseDetail,
    data: {
      title: 'tiffin_package_purchase_detail'
    }
  },
  {
    path: 'profile-setting',
    component: AccountantProfileSetting,
    data: {
      title: 'profile_setting'
    }
  }
];
