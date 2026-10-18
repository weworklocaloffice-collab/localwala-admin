import { Routes } from '@angular/router';
import { TableOrders } from './table-orders/table-orders';
import { QrTableList } from './table-orders/qr-table-list/qr-table-list';
import { TableBooking } from './table-booking/table-booking';
import { TableBookingInformation } from './table-booking/table-booking-information/table-booking-information';
import { OngoingTableOrderDetail } from './table-orders/ongoing-table-orders/ongoing-table-order-detail/ongoing-table-order-detail';
import { CompletedTableOrderDetail } from './table-orders/completed-table-orders/completed-table-order-detail/completed-table-order-detail';
import { TableOrderInvoicePrint } from './table-orders/completed-table-orders/table-order-invoice-print/table-order-invoice-print';

export const VendorTableManagementRoutes: Routes = [
  {
    path: 'orders',
    component: TableOrders,
    data: {
      title: 'table_orders_list'
    }
  },
  {
    path: 'table-qr-codes',
    component: QrTableList,
    data: {
      title: 'table_qr_list'
    }
  },
  {
    path: 'booking-list',
    component: TableBooking,
    data: {
      title: 'table_booking_management'
    }
  },
  {
    path: 'booking-detail/:id',
    component: TableBookingInformation,
    data: {
      title: 'booking_information',
    }
  },
  {
    path: 'ongoing-table-order-detail/:table/:id',
    component: OngoingTableOrderDetail,
    data: {
      title: 'ongoing_table_order_detail',
    }
  },
  {
    path: 'completed-table-order-detail/:id',
    component: CompletedTableOrderDetail,
    data: {
      title: 'order_detail',
    }
  },
  {
    path: 'completed-table-order-invoice-print/:id',
    component: TableOrderInvoicePrint,
    data: {
      title: 'table_order_invoice'
    }
  }
];
