import { Routes } from '@angular/router';
import { Orders } from './orders/orders';
import { VendorOrderDetail } from './orders/vendor-order-detail/vendor-order-detail';
import { VendorOrderInvoice } from './orders/vendor-order-invoice/vendor-order-invoice';

export const VendorOrderManagementRoutes: Routes = [
  {
    path: 'orders-list',
    component: Orders,
    data: {
      title: 'vendor_order_list'
    }
  },
  {
    path: 'order-detail/:id',
    component: VendorOrderDetail,
    data: {
      title: 'order_detail'
    }
  },
  {
    path: 'order-invoice/:id',
    component: VendorOrderInvoice,
    data: {
      title: 'order_invoice'
    }
  }
];
