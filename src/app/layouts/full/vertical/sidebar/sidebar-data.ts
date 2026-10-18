import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'home',
  },
  {
    displayName: 'dashboard',
    iconName: 'tablerChartPie2',
    route: '/admin/dashboards',
  },
  {
    displayName: 'pos',
    iconName: 'tablerApps',
    route: '/admin/dashboards/pos',
  },
  {
    navCap: 'restaurant_management',
  },
  {
    displayName: 'zone_setup',
    iconName: 'tablerMapPin',
    route: 'admin/zone-setup',
    children: [
      {
        displayName: 'cities',
        iconName: 'tablerCornerDownRight',
        route: '/admin/zone-setup/cities'
      },
      {
        displayName: 'localities',
        iconName: 'tablerCornerDownRight',
        route: '/admin/zone-setup/localities'
      }
    ]
  },
  {
    displayName: 'cuisine',
    iconName: 'tablerRadioactive',
    route: '/admin/restaurant/cuisine',
  },
  {
    displayName: 'restaurants',
    iconName: 'tablerBuildingStore',
    route: 'admin/restaurant-management',
    children: [
      {
        displayName: 'restaurant_list',
        iconName: 'tablerCornerDownRight',
        route: '/admin/restaurant-management/restaurants'
      },
      {
        displayName: 'outlet_list',
        iconName: 'tablerCornerDownRight',
        route: '/admin/restaurant-management/outlets'
      },
      {
        displayName: 'report_issue',
        iconName: 'tablerCornerDownRight',
        route: 'admin/restaurant-management/report-issue-restaurants',
      },
      {
        displayName: 'hidden_restaurants',
        iconName: 'tablerCornerDownRight',
        route: 'admin/restaurant-management/hidden-restaurants'
      },
      {
        displayName: 'restaurant_type',
        iconName: 'tablerCornerDownRight',
        route: '/admin/restaurant-management/restaurant-type',
      },
      {
        displayName: 'restaurant_facilities',
        iconName: 'tablerCornerDownRight',
        route: '/admin/restaurant-management/restaurant-facilities',
      },
      {
        displayName: 'restaurant_waiter',
        iconName: 'tablerCornerDownRight',
        route: '/admin/restaurant-management/restaurant-waiter-list',
      },
      {
        displayName: 'restaurant_kitchen_owner',
        iconName: 'tablerCornerDownRight',
        route: '/admin/restaurant-management/restaurant-kitchen-owner-list',
      },
      {
        displayName: 'new_request',
        iconName: 'tablerCornerDownRight',
        route: '/admin/restaurant-management/restaurant-joining-request',
      },
      {
        displayName: 'filter_restaurants',
        iconName: 'tablerCornerDownRight',
        route: '/admin/restaurant-management/filter-restaurant-query'
      }
    ]
  },
  {
    navCap: 'order_management',
  },
  {
    displayName: 'order_list',
    iconName: 'tablerShoppingCartBolt',
    route: 'admin/order-management/orders-list',
  },
  {
    displayName: 'un_assigned_orders',
    iconName: 'tablerScooterElectric',
    route: 'admin/order-management/un-assigned-orders-list',
  },
  {
    displayName: 'pos_orders',
    iconName: 'tablerBrandMiniprogram',
    route: 'admin/order-management/vendors-pos-order-list',
  },
  {
    displayName: 'table_orders',
    iconName: 'tablerGridScan',
    route: 'admin/order-management/vendors-table-order-list',
  },
  {
    displayName: 'tiffin_packages',
    iconName: 'tablerPaperBag',
    route: 'admin/order-management/subscription-tiffin-package',
  },
  {
    displayName: 'subscription_orders',
    iconName: 'tablerCalendarRepeat',
    route: 'admin/order-management/subscription-tiffin-orders',
  },
  {
    displayName: 'dining_booking_list',
    iconName: 'tablerBrandAirtable',
    route: 'admin/order-management/dining-booking-list',
  },
  {
    displayName: 'refund_request',
    iconName: 'tablerReceiptRefund',
    route: 'admin/order-management/refund-request',
  },
  {
    displayName: 'order_complaints',
    iconName: 'tablerMoodSad',
    route: 'admin/order-management/order-complaints',
  },
  {
    navCap: 'business_setup',
  },
  {
    displayName: 'business_setup',
    iconName: 'tablerAdjustments',
    route: 'admin/bussiness-setup',
  },
  {
    displayName: 'system_settings',
    iconName: 'tablerBinaryTree',
    route: 'admin/system-settings',
  },
  {
    displayName: 'email_templates',
    iconName: 'tablerMailCog',
    route: 'admin/system-settings/email-templates/',
  },
  {
    displayName: 'payment_settings',
    iconName: 'tablerCreditCard',
    route: 'admin/system-settings/payment-settings/',
  },
  {
    displayName: 'subscriptions',
    iconName: 'tablerCrown',
    route: 'admin/subscriptions-management',
    children: [
      {
        displayName: 'subscription_packages',
        iconName: 'tablerCornerDownRight',
        route: '/admin/subscriptions-management/subscriptions'
      },
      {
        displayName: 'subscriber_list',
        iconName: 'tablerCornerDownRight',
        route: '/admin/subscriptions-management/subscribers-list'
      },
    ]
  },
  {
    displayName: 'project_pages',
    iconName: 'tablerFileDescription',
    route: 'admin/project-pages/pages',
  },
  {
    displayName: 'cron_scheduler',
    iconName: 'tablerTimelineEventText',
    route: 'admin/bussiness-setup/cron-job-scheduler',
  },
  {
    displayName: 'joining_form',
    iconName: 'tablerLinkPlus',
    route: 'admin/bussiness-setup/joining-form-setup',
  },
  {
    displayName: 'realEstate_settings',
    iconName: 'tablerBuildingEstate',
    route: 'admin/bussiness-setup/real-estate-settings',
  },
  // Local Stores. Applications leads the group because it is the only admin surface an
  // applicant cannot bypass: nothing moves an application forward on its own.
  {
    navCap: 'stores_management',
  },
  {
    displayName: 'stores_management',
    iconName: 'tablerBuildingStore',
    route: 'admin/stores-management',
    children: [
      {
        displayName: 'stores_applications',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/applications'
      },
      {
        displayName: 'stores_chains',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/chains'
      },
      {
        displayName: 'stores_tax_configurations',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/tax-configurations'
      },
      {
        displayName: 'stores_operations',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/operations'
      },
      {
        displayName: 'stores_orders',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/orders'
      },
      {
        displayName: 'stores_settlements',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/settlements'
      },
      {
        displayName: 'stores_moderation',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/moderation'
      },
      {
        displayName: 'stores_outlets',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/outlets'
      },
      {
        displayName: 'stores_staff',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/staff'
      },
      {
        displayName: 'stores_drivers',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/drivers'
      },
      {
        displayName: 'stores_returns',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/returns'
      },
      {
        displayName: 'stores_refunds',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/refunds'
      },
      {
        displayName: 'stores_subscriptions',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/subscriptions'
      },
      {
        displayName: 'stores_products',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/products'
      },
      {
        displayName: 'stores_inventory',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/inventory'
      },
      {
        displayName: 'stores_promotions',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/promotions'
      },
      {
        displayName: 'stores_delivery',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/delivery'
      }
    ]
  },
  // Taxonomy (BR-10 / BR-11 / BR-26). A second group rather than more children above,
  // because these four are the taxonomy an Admin owns platform-wide, while the group
  // above is the operational view of individual partners.
  {
    displayName: 'stores_taxonomy',
    iconName: 'tablerCategory',
    route: 'admin/stores-management',
    children: [
      {
        displayName: 'stores_categories',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/categories'
      },
      {
        displayName: 'stores_subcategories',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/subcategories'
      },
      {
        displayName: 'stores_brands',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/brands'
      },
      {
        displayName: 'stores_attribute_templates',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/attribute-templates'
      },
      {
        displayName: 'stores_featured_placements',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/featured-placements'
      },
      {
        displayName: 'stores_policies',
        iconName: 'tablerCornerDownRight',
        route: '/admin/stores-management/policies'
      }
    ]
  },
  {
    navCap: 'dairy_management',
  },
  {
    displayName: 'ls_revenue',
    iconName: 'tablerReceipt',
    route: 'admin/local-services-management',
    children: [
      {
        displayName: 'ls_revenue_dashboard',
        iconName: 'tablerCornerDownRight',
        route: '/admin/local-services-management/revenue-dashboard'
      },
      {
        displayName: 'ls_revenue_rules',
        iconName: 'tablerCornerDownRight',
        route: '/admin/local-services-management/revenue-rules'
      },
      {
        displayName: 'ls_revenue_entries',
        iconName: 'tablerCornerDownRight',
        route: '/admin/local-services-management/revenue-entries'
      },
      {
        displayName: 'ls_categories',
        iconName: 'tablerCornerDownRight',
        route: '/admin/local-services-management/categories'
      },
      {
        displayName: 'ls_providers',
        iconName: 'tablerCornerDownRight',
        route: '/admin/local-services-management/providers'
      },
      {
        displayName: 'ls_bookings',
        iconName: 'tablerCornerDownRight',
        route: '/admin/local-services-management/bookings'
      },
      {
        displayName: 'ls_services',
        iconName: 'tablerCornerDownRight',
        route: '/admin/local-services-management/services'
      },
      {
        displayName: 'ls_facets',
        iconName: 'tablerCornerDownRight',
        route: '/admin/local-services-management/facets'
      },
      {
        displayName: 'ls_templates',
        iconName: 'tablerCornerDownRight',
        route: '/admin/local-services-management/templates'
      },
      {
        displayName: 'ls_refunds',
        iconName: 'tablerCornerDownRight',
        route: '/admin/local-services-management/refunds'
      },
      {
        displayName: 'ls_documents',
        iconName: 'tablerCornerDownRight',
        route: '/admin/local-services-management/documents'
      },
      {
        displayName: 'ls_variants',
        iconName: 'tablerCornerDownRight',
        route: '/admin/local-services-management/variants'
      },
      {
        displayName: 'ls_addons',
        iconName: 'tablerCornerDownRight',
        route: '/admin/local-services-management/addons'
      },
      {
        displayName: 'ls_mapping',
        iconName: 'tablerCornerDownRight',
        route: '/admin/local-services-management/mapping'
      },
      {
        displayName: 'ls_promotions',
        iconName: 'tablerPromotion',
        route: '/admin/local-services-management/promotions'
      },
      {
        displayName: 'ls_reports',
        iconName: 'tablerBarChart',
        route: '/admin/local-services-management/reports'
      },
      {
        displayName: 'ls_audit_logs',
        iconName: 'tablerId',
        route: '/admin/local-services-management/audit-logs'
      },
      {
        displayName: 'ls_plans',
        iconName: 'tablerTag',
        route: '/admin/local-services-management/plans'
      }
    ]
  },
  {
    displayName: 'dairy_outlets',
    iconName: 'tablerBuildingStore',
    route: 'admin/dairy-management',
    children: [
      {
        displayName: 'dairy_joining_requests',
        iconName: 'tablerCornerDownRight',
        route: '/admin/dairy-management/joining-requests'
      },
      {
        displayName: 'dairy_outlets',
        iconName: 'tablerCornerDownRight',
        route: '/admin/dairy-management/outlets'
      }
    ]
  },
  {
    displayName: 'dairy_settlements',
    iconName: 'tablerReceipt',
    route: 'admin/dairy-management',
    children: [
      {
        displayName: 'dairy_settlements',
        iconName: 'tablerCornerDownRight',
        route: '/admin/dairy-management/settlements'
      },
      {
        displayName: 'dairy_franchises',
        iconName: 'tablerCornerDownRight',
        route: '/admin/dairy-management/franchises'
      },
      {
        displayName: 'dairy_compliance',
        iconName: 'tablerCornerDownRight',
        route: '/admin/dairy-management/compliance'
      }
    ]
  },
  {
    displayName: 'dairy_verticals',
    iconName: 'tablerToggleLeft',
    route: 'admin/dairy-management',
    children: [
      {
        displayName: 'dairy_vertical_switch',
        iconName: 'tablerCornerDownRight',
        route: '/admin/dairy-management/verticals'
      }
    ]
  },
  {
    displayName: 'dairy_catalog',
    iconName: 'tablerMilk',
    route: 'admin/dairy-management',
    children: [
      {
        displayName: 'dairy_category',
        iconName: 'tablerCornerDownRight',
        route: '/admin/dairy-management/categories'
      },
      {
        displayName: 'dairy_sub_category',
        iconName: 'tablerCornerDownRight',
        route: '/admin/dairy-management/sub-categories'
      },
      {
        displayName: 'dairy_brand',
        iconName: 'tablerCornerDownRight',
        route: '/admin/dairy-management/brands'
      }
    ]
  },
  {
    navCap: 'real_estate_management',
  },
  {
    displayName: 'realEstate_title',
    iconName: 'tablerBuildingEstate',
    route: 'admin/real-estate-management',
    children: [
      {
        displayName: 'realEstate_dashboard',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/dashboard'
      },
      {
        displayName: 'realEstate_properties',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/properties'
      },
      {
        displayName: 'realEstate_property_verification',
        iconName: 'tablerClipboardCheck',
        route: '/admin/real-estate-management/property-verification'
      },
      {
        displayName: 'realEstate_executives',
        iconName: 'tablerUsers',
        route: '/admin/real-estate-management/executives'
      },
      {
        displayName: 'realEstate_executive_assignment',
        iconName: 'tablerUserCheck',
        route: '/admin/real-estate-management/executive-assignment'
      },
      {
        displayName: 'realEstate_categories',
        iconName: 'tablerCategory',
        route: '/admin/real-estate-management/categories'
      },
      {
        displayName: 'realEstate_hold_policy',
        iconName: 'tablerShieldLock',
        route: '/admin/real-estate-management/hold-policy'
      },
      {
        displayName: 'realEstate_approvals',
        iconName: 'tablerClipboardCheck',
        route: '/admin/real-estate-management/approvals'
      },
      {
        displayName: 'realEstate_listing_packages',
        iconName: 'tablerPackages',
        route: '/admin/real-estate-management/listing-packages'
      },
      {
        displayName: 'realEstate_package_payments',
        iconName: 'tablerReceipt',
        route: '/admin/real-estate-management/package-payments'
      },
      {
        displayName: 'realEstate_holds',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/holds'
      },
      {
        displayName: 'realEstate_refunds',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/refunds'
      }
    ]
  },
  {
    displayName: 'realEstate_finance',
    iconName: 'tablerReceipt',
    route: 'admin/real-estate-management',
    children: [
      {
        displayName: 'realEstate_commission_rules',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/commission-rules'
      },
      {
        displayName: 'realEstate_sales',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/sales'
      },
      {
        displayName: 'realEstate_sale_commissions',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/sale-commissions'
      },
      {
        displayName: 'realEstate_referral_earnings',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/referral-earnings'
      },
      {
        displayName: 'realEstate_executive_earnings',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/executive-earnings'
      },
      {
        displayName: 'realEstate_bank_commissions',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/bank-commissions'
      },
      {
        displayName: 'realEstate_settlements',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/settlements'
      },
      {
        displayName: 'realEstate_ledger',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/ledger'
      },
      {
        displayName: 'realEstate_hold_payments',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/hold-payments'
      },
      {
        displayName: 'realEstate_reconciliation',
        iconName: 'tablerScale',
        route: '/admin/real-estate-management/reconciliation'
      },
      {
        displayName: 'realEstate_custody_statements',
        iconName: 'tablerBuildingBank',
        route: '/admin/real-estate-management/custody-statements'
      }
    ]
  },
  {
    displayName: 'realEstate_pipeline',
    iconName: 'tablerFilter',
    route: 'admin/real-estate-management',
    children: [
      {
        displayName: 'realEstate_vendors',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/vendors'
      },
      {
        displayName: 'realEstate_vendor_verification',
        iconName: 'tablerClipboardCheck',
        route: '/admin/real-estate-management/vendor-verification'
      },
      {
        displayName: 'realEstate_leads_title',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/leads'
      },
      {
        displayName: 'realEstate_referrals',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/referrals'
      },
      {
        displayName: 'realEstate_visits',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/visits'
      },
      {
        displayName: 'realEstate_loans',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/loans'
      },
      {
        displayName: 'realEstate_documents',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/documents'
      },
      {
        displayName: 'realEstate_audit_logs',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/audit-logs'
      },
      {
        displayName: 'realEstate_promotions',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/promotions'
      },
      {
        displayName: 'realEstate_banks',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/banks'
      },
      {
        displayName: 'realEstate_bank_offers',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/bank-offers'
      },
      {
        displayName: 'realEstate_bank_agreements',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/bank-agreements'
      },
      {
        displayName: 'realEstate_reports',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/reports'
      },
      {
        displayName: 'realEstate_compliance',
        iconName: 'tablerCornerDownRight',
        route: '/admin/real-estate-management/compliance'
      }
    ]
  },
  {
    navCap: 'food_management',
  },
  {
    displayName: 'categories',
    iconName: 'tablerCategory2',
    route: 'admin/food-management',
    children: [
      {
        displayName: 'category',
        iconName: 'tablerCornerDownRight',
        route: '/admin/food-management/categories'
      },
      {
        displayName: 'sub_category',
        iconName: 'tablerCornerDownRight',
        route: '/admin/food-management/sub-categories'
      }
    ]
  },
  {
    displayName: 'foods',
    iconName: 'tablerToolsKitchen2',
    route: '/admin/foods/list',
  },
  {
    displayName: 'addons',
    iconName: 'tablerPepper',
    route: '/admin/foods/addons',
  },
  {
    displayName: 'food_taxation',
    iconName: 'tablerPercentage',
    route: '/admin/foods/food-taxation-list',
  },
  {
    navCap: 'delivery_management'
  },
  {
    displayName: 'vehicles',
    iconName: 'tablerMoped',
    route: '/admin/delivery-management/vehicles'
  },
  {
    displayName: 'shift_schedule',
    iconName: 'tablerClock',
    route: '/admin/delivery-management/delivery-shift-schedule'
  },
  {
    displayName: 'deliveryman',
    iconName: 'tablerRun',
    route: 'admin/driver-management',
    children: [
      {
        displayName: 'deliveryman_list',
        iconName: 'tablerCornerDownRight',
        route: '/admin/driver-management/delivery-partners'
      },
      {
        displayName: 'add_fund',
        iconName: 'tablerCornerDownRight',
        route: '/admin/driver-management/wallet-add-fund'
      },
      {
        displayName: 'new_request',
        iconName: 'tablerCornerDownRight',
        route: '/admin/driver-management/deliveryman-joining-request'
      },
    ]
  },
  {
    navCap: 'customer_management'
  },
  {
    displayName: 'customers',
    iconName: 'tablerUsers',
    route: '/admin/customer-management/customers'
  },
  {
    displayName: 'wallet',
    iconName: 'tablerWallet',
    route: 'admin/customer-wallet-management',
    children: [
      {
        displayName: 'add_fund',
        iconName: 'tablerCornerDownRight',
        route: '/admin/customer-wallet-management/wallet-add-fund'
      },
      {
        displayName: 'wallet_bonus',
        iconName: 'tablerCornerDownRight',
        route: '/admin/customer-wallet-management/wallet-bonus'
      },
    ]
  },
  {
    displayName: 'loyalty_point_report',
    iconName: 'tablerCertificate',
    route: '/admin/customer-management/loyalty-points-report'
  },
  {
    displayName: 'deleted_accounts',
    iconName: 'tablerUserX',
    route: 'admin/deleted-accounts',
    children: [
      {
        displayName: 'customer_accounts',
        iconName: 'tablerCornerDownRight',
        route: '/admin/deleted-accounts/customer-deleted-account'
      },
      {
        displayName: 'restaurant_accounts',
        iconName: 'tablerCornerDownRight',
        route: '/admin/deleted-accounts/restaurant-deleted-account'
      },
      {
        displayName: 'deliveryman_accounts',
        iconName: 'tablerCornerDownRight',
        route: '/admin/deleted-accounts/deliveryman-deleted-account'
      },
      {
        displayName: 'waiter_accounts',
        iconName: 'tablerCornerDownRight',
        route: '/admin/deleted-accounts/waiter-deleted-account'
      },
      {
        displayName: 'kitchen_owner_accounts',
        iconName: 'tablerCornerDownRight',
        route: '/admin/deleted-accounts/kitchen-deleted-accounts'
      },
    ]
  },
  {
    displayName: 'chat',
    iconName: 'tablerBrandHipchat',
    route: '/admin/customer-management/chat-list'
  },
  {
    navCap: 'feedback_management',
  },
  {
    displayName: 'feedback',
    iconName: 'tablerFileAnalytics',
    route: '/admin/feedback-report-list/feedback-list'
  },
  {
    displayName: 'report_emergency',
    iconName: 'tablerPackageImport',
    route: '/admin/feedback-report-list/report-emergency'
  },
  {
    navCap: 'promo_management',
  },
  {
    displayName: 'campaigns',
    iconName: 'tablerSpeakerphone',
    route: 'admin/promotion-management',
    children: [
      {
        displayName: 'restaurant_campaign',
        iconName: 'tablerCornerDownRight',
        route: '/admin/promotion-management/restaurant-campaign'
      },
      {
        displayName: 'dining_campaign',
        iconName: 'tablerCornerDownRight',
        route: '/admin/promotion-management/dining-campaign'
      },
      {
        displayName: 'food_campaign',
        iconName: 'tablerCornerDownRight',
        route: '/admin/promotion-management/food-campaign'
      },
      {
        displayName: 'notification',
        iconName: 'tablerBellRinging2',
        route: '/admin/promotion-management/notifications'
      },
    ]
  },
  {
    displayName: 'coupons',
    iconName: 'tablerTicket',
    route: '/admin/coupons/coupon-list'
  },
  {
    displayName: 'banners',
    iconName: 'tablerFlag3',
    route: '/admin/banners/banner-list'
  },
  // Header & Promotional Banner Configuration. Separate from `banners` above:
  // that one drives the legacy in-body carousel, this one owns the silver app bar
  // plus the promotional banner slot. See API src/modules/header-banner.
  {
    displayName: 'header_banner',
    iconName: 'tablerLayoutHeader',
    route: '/admin/promotion-management/header-banner'
  },
  {
    displayName: 'reels',
    iconName: 'tablerMovie',
    route: '/admin/reels/reel-list'
  },
  {
    displayName: 'media',
    iconName: 'tablerPhotoSearch',
    route: '/admin/media'
  },
  {
    navCap: 'transaction_management',
  },
  {
    displayName: 'collect_cash',
    iconName: 'tablerWallet',
    route: '/admin/transaction/collection-cash'
  },
  {
    displayName: 'restaurant_withdraws',
    iconName: 'tablerReceipt2',
    route: '/admin/transaction/restaurant-withdraws'
  },
  {
    displayName: 'deliveryman_withdraws',
    iconName: 'tablerBike',
    route: '/admin/transaction/deliveryman-withdraws'
  },
  {
    displayName: 'withdrawal_methods',
    iconName: 'tablerPigMoney',
    route: '/admin/transaction/withdrawal-methods'
  },
  {
    displayName: 'disbursements',
    iconName: 'tablerAdjustmentsDollar',
    route: 'admin/disbursements-transaction',
    children: [
      {
        displayName: 'restaurant',
        iconName: 'tablerCornerDownRight',
        route: '/admin/disbursements-transaction/restaurant-disbursements'
      },
      {
        displayName: 'deliveryman',
        iconName: 'tablerCornerDownRight',
        route: '/admin/disbursements-transaction/deliveryman-disbursements'
      },
    ]
  },
  {
    navCap: 'report_management',
  },
  {
    displayName: 'expense_report',
    iconName: 'tablerMessageDollar',
    route: '/admin/reports/admin-expenses-report'
  },
  {
    displayName: 'order_report',
    iconName: 'tablerClipboardText',
    route: 'admin/order-reports',
    children: [
      {
        displayName: 'regular_order_report',
        iconName: 'tablerCornerDownRight',
        route: '/admin/order-reports/regular-order-report'
      },
      {
        displayName: 'pos_order_report',
        iconName: 'tablerCornerDownRight',
        route: '/admin/order-reports/pos-order-report'
      },
      {
        displayName: 'table_order_report',
        iconName: 'tablerCornerDownRight',
        route: '/admin/order-reports/table-order-report'
      },
    ]
  },
  {
    displayName: 'wallet_report',
    iconName: 'tablerWallpaper',
    route: '/admin/reports/wallet-transaction-report'
  },
  {
    displayName: 'payment_report',
    iconName: 'tablerMicrowave',
    route: '/admin/reports/payment-transaction-report'
  },
  {
    displayName: 'dining_booking_report',
    iconName: 'tablerMichelinStarGreen',
    route: '/admin/reports/dining-booking-report'
  },
  {
    displayName: 'food_report',
    iconName: 'tablerBurger',
    route: '/admin/reports/food-report'
  },
  {
    displayName: 'restaurant_report',
    iconName: 'tablerBuildingBank',
    route: '/admin/reports/restaurant-report'
  },
  {
    displayName: 'customer_report',
    iconName: 'tablerUserScan',
    route: '/admin/reports/customer-report'
  },
  {
    displayName: 'deliveryman_report',
    iconName: 'tablerMoped',
    route: '/admin/reports/deliveryman-report'
  },
  {
    displayName: 'disbursement_report',
    iconName: 'tablerCashBanknote',
    route: 'admin/disbursement-reports',
    children: [
      {
        displayName: 'restaurant',
        iconName: 'tablerCornerDownRight',
        route: '/admin/disbursement-reports/restaurant-disbursement-report'
      },
      {
        displayName: 'deliveryman',
        iconName: 'tablerCornerDownRight',
        route: '/admin/disbursement-reports/deliveryman-disbursement-report'
      },
    ]
  },
  {
    navCap: 'role_management',
  },
  {
    displayName: 'admin_team',
    iconName: 'tablerChessKing',
    route: '/admin/team-list/admin-team-list'
  },
  {
    displayName: 'accountant_team',
    iconName: 'tablerAddressBook',
    route: '/admin/team-list/accountant-team-list'
  },
  {
    displayName: 'cityzen_team',
    iconName: 'tablerUserPin',
    route: '/admin/team-list/cityzen-team-list'
  },
  {
    displayName: 'support_team',
    iconName: 'tablerHeadset',
    route: '/admin/team-list/support-team-list'
  },
];
