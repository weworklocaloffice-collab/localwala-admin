import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Pos } from './pos/pos';
import { PosOrdersList } from './pos/pos-orders-list/pos-orders-list';
import { PosOrderDetail } from './pos/pos-order-detail/pos-order-detail';
import { PosOrderInvoicePrint } from './pos/pos-order-invoice-print/pos-order-invoice-print';

export const VendorDashboardRoutes: Routes = [
  {
    path: '',
    component: Dashboard,
    data: {
      title: 'vendor_dashboard'
    }
  },
  {
    path: 'pos',
    component: Pos,
    data: {
      title: 'vendor_pos_system'
    }
  },
  {
    path: 'pos-order-list',
    component: PosOrdersList,
    data: {
      title: 'pos_order_list'
    }
  },
  {
    path: 'pos-order-detail/:id',
    component: PosOrderDetail,
    data: {
      title: 'pos_order_detail'
    }
  },
  {
    path: 'pos-order-print-invoice/:id',
    component: PosOrderInvoicePrint,
    data: {
      title: 'pos_invoice'
    }
  }
];
