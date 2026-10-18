import { Routes } from '@angular/router';
import { RegularOrdersReport } from './orders-report/regular-orders-report/regular-orders-report';
import { PosOrdersReport } from './orders-report/pos-orders-report/pos-orders-report';
import { TableOrdersReport } from './orders-report/table-orders-report/table-orders-report';
import { WalletTransactionsReport } from './wallet-transactions-report/wallet-transactions-report';
import { PaymentTransactionsReport } from './payment-transactions-report/payment-transactions-report';
import { AdminExpenseReport } from './admin-expense-report/admin-expense-report';
import { DiningBookingReport } from './dining-booking-report/dining-booking-report';
import { FoodReport } from './food-report/food-report';
import { RestaurantReport } from './restaurant-report/restaurant-report';
import { CustomerReport } from './customer-report/customer-report';
import { DeliverymanDisbursementReport } from './deliveryman-disbursement-report/deliveryman-disbursement-report';
import { RestaurantDisbursementReport } from './restaurant-disbursement-report/restaurant-disbursement-report';
import { DeliverymanReport } from './deliveryman-report/deliveryman-report';

export const ReportManagementRoutes: Routes = [
  {
    path: 'regular-order-report',
    component: RegularOrdersReport,
    data: {
      title: 'regular_order_report'
    }
  },
  {
    path: 'pos-order-report',
    component: PosOrdersReport,
    data: {
      title: 'pos_order_report'
    }
  },
  {
    path: 'table-order-report',
    component: TableOrdersReport,
    data: {
      title: 'table_order_report'
    }
  },
  {
    path: 'wallet-transaction-report',
    component: WalletTransactionsReport,
    data: {
      title: 'wallet_transactions_report',
    }
  },
  {
    path: 'payment-transaction-report',
    component: PaymentTransactionsReport,
    data: {
      title: 'payment_transaction_report'
    }
  },
  {
    path: 'admin-expenses-report',
    component: AdminExpenseReport,
    data: {
      title: 'expense_report'
    }
  },
  {
    path: 'dining-booking-report',
    component: DiningBookingReport,
    data: {
      title: 'dining_booking_report'
    }
  },
  {
    path: 'food-report',
    component: FoodReport,
    data: {
      title: 'food_report'
    }
  },
  {
    path: 'restaurant-report',
    component: RestaurantReport,
    data: {
      title: 'restaurant_report'
    }
  },
  {
    path: 'customer-report',
    component: CustomerReport,
    data: {
      title: 'customer_report'
    }
  },
  {
    path: 'deliveryman-report',
    component: DeliverymanReport,
    data: {
      title: 'deliveryman_report'
    }
  },
  {
    path: 'restaurant-disbursement-report',
    component: RestaurantDisbursementReport,
    data: {
      title: 'restaurant_disbursement_report'
    }
  },
  {
    path: 'deliveryman-disbursement-report',
    component: DeliverymanDisbursementReport,
    data: {
      title: 'deliveryman_disbursement_report'
    }
  }
];
