import { Routes } from '@angular/router';
import { JhatkaOperations } from './operations/operations';
import { JhatkaOutletDetail } from './outlet-detail/outlet-detail';
import { JhatkaSupplierDetail } from './supplier-detail/supplier-detail';
import { JhatkaSettlementDetail } from './settlement-detail/settlement-detail';
import { JhatkaOrderDetail } from './order-detail/order-detail';
import { JhatkaOrderInvoice } from './order-invoice/order-invoice';
import { JhatkaOrderSupport } from './order-support/order-support';
import { JhatkaCatalogue } from './catalogue/catalogue';
import { JhatkaSuppliers } from './suppliers/suppliers';
import { JhatkaCompliance } from './compliance/compliance';
import { JhatkaOutlets } from './outlets/outlets';
import { JhatkaOutletForm } from './outlets/outlet-form/outlet-form';
import { JhatkaOrders } from './orders/orders';
import { JhatkaRecalls } from './recalls/recalls';
import { JhatkaInventory } from './inventory/inventory';
import { JhatkaVariance } from './variance/variance';
import { JhatkaSupply } from './supply/supply';
import { JhatkaSettlements } from './settlements/settlements';
import { JhatkaAnalytics } from './analytics/analytics';
import { JhatkaQualityReasons } from './quality-reasons/quality-reasons';

export const JhatkaManagementRoutes: Routes = [
  {
    path: '',
    redirectTo: 'analytics',
    pathMatch: 'full',
  },
  {
    path: 'analytics',
    component: JhatkaAnalytics,
    data: {
      title: 'jhatka_overview',
    },
  },
  {
    path: 'outlets',
    component: JhatkaOutlets,
    data: {
      title: 'jhatka_outlets',
    },
  },
  {
    path: 'outlets/new',
    component: JhatkaOutletForm,
    data: {
      title: 'jhatka_outlet_create',
    },
  },
  {
    path: 'outlets/:id/edit',
    component: JhatkaOutletForm,
    data: {
      title: 'jhatka_outlet_edit',
    },
  },
  {
    path: 'catalogue',
    component: JhatkaCatalogue,
    data: {
      title: 'jhatka_catalogue',
    },
  },
  {
    path: 'taxonomy',
    redirectTo: 'catalogue',
    pathMatch: 'full',
  },
  {
    path: 'suppliers',
    component: JhatkaSuppliers,
    data: {
      title: 'jhatka_suppliers',
    },
  },
  {
    path: 'compliance',
    component: JhatkaCompliance,
    data: {
      title: 'jhatka_compliance',
    },
  },
  {
    path: 'operations',
    component: JhatkaOperations,
    data: {
      title: 'jhatka_operations',
    },
  },
  {
    path: 'quality-reasons',
    component: JhatkaQualityReasons,
    data: {
      title: 'jhatka_quality_reasons',
    },
  },
  {
    path: 'order-support',
    component: JhatkaOrderSupport,
    data: {
      title: 'jhatka_order_support',
    },
  },
  {
    path: 'order-detail/:id',
    component: JhatkaOrderDetail,
    data: {
      title: 'jhatka_order_detail',
    },
  },
  {
    path: 'order-invoice/:id',
    component: JhatkaOrderInvoice,
    data: {
      title: 'jhatka_order_invoice',
    },
  },
  {
    path: 'supplier-detail/:id',
    component: JhatkaSupplierDetail,
    data: {
      title: 'jhatka_supplier_detail',
    },
  },
  {
    path: 'settlement-detail/:id',
    component: JhatkaSettlementDetail,
    data: {
      title: 'jhatka_settlement_detail',
    },
  },
  {
    path: 'outlet-detail/:id',
    component: JhatkaOutletDetail,
    data: {
      title: 'jhatka_outlet_detail',
    },
  },
  {
    path: 'orders',
    component: JhatkaOrders,
    data: {
      title: 'jhatka_orders',
    },
  },
  {
    path: 'recalls',
    component: JhatkaRecalls,
    data: {
      title: 'jhatka_recalls',
    },
  },
  {
    path: 'inventory',
    component: JhatkaInventory,
    data: {
      title: 'jhatka_inventory',
    },
  },
  {
    path: 'supply',
    component: JhatkaSupply,
    data: {
      title: 'jhatka_supply',
    },
  },
  {
    path: 'variance',
    component: JhatkaVariance,
    data: {
      title: 'jhatka_variance',
    },
  },
  {
    path: 'settlements',
    component: JhatkaSettlements,
    data: {
      title: 'jhatka_settlements',
    },
  },
];

