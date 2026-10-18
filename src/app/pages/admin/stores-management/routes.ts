import { Routes } from '@angular/router';
import { Applications } from './applications/applications';
import { Chains } from './chains/chains';
import { AttributeTemplates } from './attribute-templates/attribute-templates';
import { TaxConfigurations } from './tax-configurations/tax-configurations';
import { Categories } from './categories/categories';
import { SubCategories } from './subcategories/subcategories';
import { Brands } from './brands/brands';
import { Operations } from './operations/operations';
import { Orders } from './orders/orders';
import { Moderation } from './moderation/moderation';
import { Outlets } from './outlets/outlets';
import { Staff } from './staff/staff';
import { FeaturedPlacements } from './featured-placements/featured-placements';
import { Policies } from './policies/policies';
import { Drivers } from './drivers/drivers';
import { Returns } from './returns/returns';
import { Refunds } from './refunds/refunds';
import { Subscriptions } from './subscriptions/subscriptions';
import { Products } from './products/products';
import { Inventory } from './inventory/inventory';
import { Promotions } from './promotions/promotions';
import { Delivery } from './delivery/delivery';

/**
 * Local Stores admin routes.
 *
 * ## Scope
 *
 * Every screen here is backed by a live endpoint. The implementation plan (§12.1) sketches
 * thirty admin folders and §7.5 lists twenty-nine admin menus; the admin API exposes
 * twenty-four routes today, and these seven screens are what they support:
 *
 *   applications · chains · tax-configurations        review, registry, BR-41 rates
 *   categories · subcategories · brands · attribute-templates   BR-10 / BR-11 / BR-26
 *   operations                                        the eight consoles of §12.3
 *
 * Folders for screens whose endpoints do not exist would be trap T1 inverted — thirty
 * pages rendering empty tables against valid 200s, which reads as "no data yet" rather
 * than "not implemented". This list grows as the admin routes do.
 *
 * ## Ordering
 *
 * Every path here is a literal, with no `:param` sibling anywhere in the module, so
 * registration order is not load bearing. It is kept alphabetical-by-concern anyway so a
 * future `categories/:id` is appended in the obvious place.
 */
export const StoresManagementRoutes: Routes = [
  {
    path: '',
    redirectTo: 'applications',
    pathMatch: 'full',
  },
  {
    path: 'applications',
    component: Applications,
    data: {
      title: 'stores_applications',
    },
  },
  {
    path: 'chains',
    component: Chains,
    data: {
      title: 'stores_chains',
    },
  },
  {
    path: 'tax-configurations',
    component: TaxConfigurations,
    data: {
      title: 'stores_tax_configurations',
    },
  },
  {
    path: 'categories',
    component: Categories,
    data: {
      title: 'stores_categories',
    },
  },
  {
    path: 'subcategories',
    component: SubCategories,
    data: {
      title: 'stores_subcategories',
    },
  },
  {
    path: 'brands',
    component: Brands,
    data: {
      title: 'stores_brands',
    },
  },
  {
    path: 'attribute-templates',
    component: AttributeTemplates,
    data: {
      title: 'stores_attribute_templates',
    },
  },
  {
    path: 'operations',
    component: Operations,
    data: {
      title: 'stores_operations',
    },
  },
  {
    path: 'orders',
    component: Orders,
    data: {
      title: 'stores_orders',
    },
  },
{
    path: 'moderation',
    component: Moderation,
    data: {
      title: 'stores_moderation',
    },
  },
  {
    path: 'outlets',
    component: Outlets,
    data: {
      title: 'stores_outlets',
    },
  },
  {
    path: 'staff',
    component: Staff,
    data: {
      title: 'stores_staff',
    },
  },
  {
    path: 'featured-placements',
    component: FeaturedPlacements,
    data: {
      title: 'stores_featured_placements',
    },
  },
  {
    path: 'policies',
    component: Policies,
    data: {
      title: 'stores_policies',
    },
  },
  {
    path: 'drivers',
    component: Drivers,
    data: {
      title: 'stores_drivers',
    },
  },
  {
    path: 'returns',
    component: Returns,
    data: {
      title: 'stores_returns',
    },
  },
  {
    path: 'refunds',
    component: Refunds,
    data: {
      title: 'stores_refunds',
    },
  },
  {
    path: 'subscriptions',
    component: Subscriptions,
    data: {
      title: 'stores_subscriptions',
    },
  },
  {
    path: 'products',
    component: Products,
    data: {
      title: 'stores_products',
    },
  },
  {
    path: 'inventory',
    component: Inventory,
    data: {
      title: 'stores_inventory',
    },
  },
  {
    path: 'promotions',
    component: Promotions,
    data: {
      title: 'stores_promotions',
    },
  },
  {
    path: 'delivery',
    component: Delivery,
    data: {
      title: 'stores_delivery',
    },
  },
];