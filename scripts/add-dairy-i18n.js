/*
 * Adds the dairy-management keys to en/ar/es/hi.
 *
 * The panel's i18n is a single flat object per locale with all four files kept in
 * sync by hand, so this inserts the same key block into each one. `en` is the
 * de-facto reference — `findKeyByValueInValueInLang` reverse-searches it when it
 * translates an API error message back into a key.
 *
 * The other three get English placeholders. A missing key renders as the raw key
 * string (`dairy_verticals_title`) because `TranslateService.instant()` echoes
 * unknown keys, which is far worse in the UI than an untranslated but readable
 * English string. Real translations are a translation pass, not something to
 * invent while wiring screens.
 */

const fs = require('fs');
const path = require('path');

const KEYS = {
  en: {
    // Generic keys reused from the existing dairy block below. `th_status`,
    // `click_to_edit` and `click_to_delete` already exist in the panel; these are the
    // ones the dairy screens need that did not.
    th_search: 'Search',
    th_all: 'All',
    ts_add_new: 'Add New',
    ts_submit: 'Submit',
    ts_no_records_found: 'No records found',
    ts_entity_enabled: 'Enabled',
    ts_entity_disabled: 'Disabled',
    ts_dairy_delete_instruction:
      'If yes this will be removed from the system and the action cannot be undone',
    ts_dairy_taxonomy_in_use: 'This cannot be deleted while something still uses it',
    ph_lowercase_key: 'e.g. paneer',
    ph_key_hint: 'Lowercase letters, numbers and dashes only. Products reference this.',
    ph_key_immutable: 'The key cannot be changed after creation',
    form_key_invalid: 'Use lowercase letters, numbers and dashes only',

    dairy_management: 'Dairy Management',
    dairy_verticals: 'Verticals',
    dairy_vertical_switch: 'Vertical Switch',
    dairy_catalog: 'Dairy Catalog',
    dairy_category: 'Category',
    dairy_sub_category: 'Sub Category',
    dairy_brand: 'Brand',

    dairy_verticals_title: 'Verticals',
    dairy_verticals_subtitle: 'Which business lines the platform offers, and whether each one is trading',
    dairy_halted_banner_title: 'Dairy is halted',
    dairy_halted_banner_body:
      'New orders, plans and outlets are refused. Everything already in progress continues as normal.',
    dairy_no_verticals: 'No verticals are registered',
    dairy_switch_is_on: 'Trading',
    dairy_switch_is_off: 'Halted',
    dairy_state_trading: 'Trading',
    dairy_state_halted: 'Halted',

    ts_halt_vertical_title: 'Halt this vertical?',
    ts_halt_vertical_warning:
      'New orders, plans and outlets will be refused immediately. This affects every outlet on this vertical.',
    ts_halt_vertical_still_allowed:
      'Existing orders keep moving, and settlements and rider payouts continue as normal.',
    ts_outlets_affected: 'outlet(s) will stop taking new work.',
    ts_yes_halt_it: 'Yes, halt it',
    ts_vertical_halted: 'Vertical halted',
    ts_vertical_enabled: 'Vertical enabled',

    th_outlets: 'Outlets',
    th_last_changed: 'Last Changed',
    th_reason: 'Reason',
    th_key: 'Key',
    ph_reason_for_halt: 'Why is this being halted?',
    form_reason_too_short: 'Please give a slightly longer reason',
    common_enabled: 'Enabled',
    common_disabled: 'Disabled',

    dairy_categories: 'Dairy Categories',
    dairy_sub_categories: 'Dairy Sub Categories',
    dairy_brands: 'Dairy Brands',
    ts_dairy_category_added: 'Category added!',
    ts_dairy_category_updated: 'Category updated!',
    ts_dairy_category_deleted: 'Category deleted!',
    ts_dairy_sub_category_added: 'Sub category added!',
    ts_dairy_sub_category_updated: 'Sub category updated!',
    ts_dairy_sub_category_deleted: 'Sub category deleted!',
    ts_dairy_brand_added: 'Brand added!',
    ts_dairy_brand_updated: 'Brand updated!',
    ts_dairy_brand_deleted: 'Brand deleted!',
    ts_dairy_entity_deleted: 'Deleted!',
    add_dairy_category: 'Add Category',
    update_dairy_category: 'Update Category',
    add_dairy_sub_category: 'Add Sub Category',
    update_dairy_sub_category: 'Update Sub Category',
    add_dairy_brand: 'Add Brand',
    update_dairy_brand: 'Update Brand',
    choose_main_category: 'Choose main category',
    brand_name: 'Brand name',
    country: 'Country',
    manufacturer: 'Manufacturer',
    fssai_licence: 'FSSAI licence',
    description: 'Description',
    featured: 'Featured',
    sort_order: 'Sort order',
    ts_dairy_brand_in_use:
      'This brand cannot be deleted while a product still uses it. Move the products first.',

    // Outlets and review
    dairy_joining_requests: 'Joining Requests',
    dairy_joining_requests_subtitle: 'Self-registered outlets waiting for a decision',
    dairy_no_pending_requests: 'Nothing is waiting for a decision',
    dairy_no_location_on_record: 'No location on record',
    dairy_approve: 'Approve',
    dairy_reject: 'Reject',
    dairy_status_pending: 'Pending',
    dairy_status_approved: 'Approved',
    dairy_status_rejected: 'Rejected',
    dairy_status_active: 'Active',
    dairy_status_suspended: 'Suspended',
    dairy_status_terminated: 'Terminated',
    th_business: 'Business',
    th_location: 'Location',
    th_applicant: 'Applicant',
    th_commission: 'Commission',
    th_commission_basis: 'Commission on',
    th_driver_payout: 'Rider paid by',
    th_payout_method: 'Payout method',
    th_account_name: 'Account name',
    th_account_number: 'Account number',
    th_ifsc: 'IFSC',
    th_upi_id: 'UPI ID',
    th_start_date: 'Start date',
    th_end_date: 'End date',
    th_minimum_guarantee: 'Minimum guarantee',
    ph_reason_optional: 'Optional',
    ph_reason_required: 'Required',
    ph_commission_hint: 'Percentage, 0 to 100',
    ph_search_hint: 'Search by name or address',
    form_commission_range: 'Commission must be between 0 and 100',
    dairy_basis_product_only: 'Product only',
    dairy_basis_product_and_delivery: 'Product and delivery',
    dairy_payout_platform_pays: 'Platform pays',
    dairy_payout_business_pays: 'Outlet pays',
    dairy_method_wallet: 'Wallet',
    dairy_method_bank: 'Bank',
    dairy_payout_details: 'Payout details',
    dairy_agreement: 'Agreement',
    dairy_notes: 'Notes',
    dairy_not_set: 'Not set',

    dairy_outlets: 'Outlets',
    dairy_outlets_subtitle: 'Commission terms and trading status for every dairy outlet',
    dairy_edit_terms: 'Edit terms',
    dairy_edit_terms_title: 'Outlet terms',
    dairy_suspend: 'Suspend',
    dairy_reactivate: 'Reactivate',
    dairy_terminate: 'Terminate',
    dairy_outlet_status_pending: 'Pending',
    dairy_outlet_status_active: 'Active',
    dairy_outlet_status_suspended: 'Suspended',
    dairy_outlet_status_terminated: 'Terminated',

    ts_outlet_approved: 'Outlet approved',
    ts_outlet_rejected: 'Outlet rejected',
    ts_outlet_terms_updated: 'Outlet terms updated',
    ts_outlet_status_updated: 'Outlet status updated',
    ts_outlet_reactivated: 'Outlet reactivated',
    ts_reject_outlet_instruction:
      'The applicant will see this reason, so say something they can act on',
    ts_yes_reject_it: 'Yes, reject it',
    ts_approve_outlet_title: 'Approve this outlet?',
    ts_approve_outlet_body:
      'Approving lets the outlet take orders and raise payouts. It can be suspended later.',
    ts_reject_outlet_title: 'Reject this outlet?',
    ts_reject_outlet_body: 'The outlet stays unverified and cannot trade.',
    ts_reactivate_outlet_title: 'Reactivate this outlet?',
    ts_suspend_outlet_title: 'Suspend this outlet?',
    ts_suspend_outlet_body:
      'The outlet stops trading immediately. In-flight deliveries and pending payouts are not cancelled.',
    ts_terminate_outlet_title: 'Terminate this outlet?',
    ts_terminate_outlet_warning:
      'Termination is the end of the relationship. It can be reversed, but it should not be a misclick.',
    dairy_approve_no_location_warning:
      'This outlet has no city or locality on record. It cannot be dispatched to until that is fixed.',

    // Settlements
    dairy_settlements: 'Settlements',
    dairy_settlements_subtitle: 'Commission and franchise statements, and their approval',
    dairy_generate_settlement: 'Generate settlement',
    dairy_pay: 'Pay',
    dairy_status_draft: 'Draft',
    dairy_status_submitted: 'Submitted',
    dairy_status_approved: 'Approved',
    dairy_status_disputed: 'Disputed',
    dairy_status_paid: 'Paid',
    dairy_status_void: 'Void',
    dairy_type_commission: 'Commission',
    dairy_type_franchise: 'Franchise',
    dairy_type_partner: 'Partner',
    dairy_type_franchisee: 'Franchisee',
    dairy_period_daily: 'Daily',
    dairy_period_weekly: 'Weekly',
    dairy_period_monthly: 'Monthly',
    dairy_do_submitted: 'Submit for approval',
    dairy_do_approved: 'Approve',
    dairy_do_draft: 'Return to draft',
    dairy_do_disputed: 'Raise a dispute',
    dairy_do_void: 'Void',
    dairy_paid_on: 'Paid on',
    th_settlement_no: 'Settlement',
    th_party: 'Partner / Franchisee',
    th_period: 'Period',
    th_net_amount: 'Net amount',
    th_rate: 'Rate',
    th_type: 'Type',
    th_count: 'Count',
    th_gross_sales: 'Gross sales',
    th_reference: 'Reference',
    th_settled_with: 'Settled with',
    th_reference_date: 'Reference date',
    ph_payment_reference: 'Bank or UPI reference',
    ph_reference_date_hint: 'Leave empty for the current period',
    form_reference_too_short: 'Please give a slightly longer reason',
    ts_settlement_generated: 'Settlement generated',
    ts_settlement_updated: 'Settlement updated',
    ts_settlement_paid: 'Settlement paid',
    ts_change_status_title: 'Change settlement status',
    ts_pay_settlement_title: 'Pay this settlement?',
    ts_void_settlement_warning:
      'Voiding writes off a financial statement. It cannot be reopened afterwards.',
    ts_approve_settlement_body:
      'Approving locks the amounts. They will not change if orders are edited later.',
    ts_pay_settlement_body: 'This pays the net amount and closes the statement.',
    ts_negative_settlement_warning:
      'This net amount is negative, so the outlet owes the platform rather than the other way round.',
    ts_generate_settlement_body:
      'A draft is created from the orders in the period. Check the amounts before submitting it for approval.',
    ts_confirm: 'Confirm',

    // Franchise
    dairy_franchises: 'Franchises',
    dairy_franchises_subtitle: 'Franchise agreements, revenue share and territory',
    dairy_franchise_status_pending: 'Pending',
    dairy_franchise_status_active: 'Active',
    dairy_franchise_status_suspended: 'Suspended',
    dairy_franchise_status_expired: 'Expired',
    dairy_franchise_status_terminated: 'Terminated',
    dairy_franchise_status_title: 'Franchise status',
    dairy_add_franchise_title: 'Add a franchise agreement',
    dairy_revenue_share: 'Revenue share',
    dairy_fees: 'Fees',
    dairy_supply_and_territory: 'Supply and territory',
    th_revenue_share: 'Revenue share',
    th_supply_model: 'Supply model',
    th_territory: 'Territory',
    th_territory_city: 'Territory city',
    th_outlet: 'Outlet',
    th_operator: 'Operator',
    th_franchise_name: 'Franchise name',
    th_franchise_code: 'Franchise code',
    th_joining_fee: 'Joining fee',
    th_royalty: 'Royalty',
    th_royalty_frequency: 'Royalty frequency',
    th_not_set: 'Not set',
    ph_operator_hint: 'The person who runs this franchise',
    ph_code_must_be_unique: 'Must be unique',
    dairy_on_product_only: 'Product only',
    dairy_on_product_and_delivery: 'Product and delivery',
    dairy_supply_platform_supplied: 'Platform supplied',
    dairy_supply_local_procurement: 'Local procurement',
    dairy_supply_mixed: 'Mixed',
    dairy_frequency_quarterly: 'Quarterly',
    dairy_frequency_annual: 'Annual',
    dairy_procurement_enabled: 'Local procurement',
    ts_franchise_created: 'Franchise created',
    ts_franchise_status_updated: 'Franchise status updated',
    ts_change_franchise_status_title: 'Change franchise status',
    ts_terminate_franchise_warning:
      'Terminating ends the agreement. It cannot be reopened, only replaced with a new one.',
    ts_suspend_franchise_body:
      'The franchise stops trading immediately. In-flight deliveries are not cancelled.',
    // Tooltips for the franchise transition buttons. The settlements screen uses the
    // same `dairy_do_*` prefix with its own status names, so both live together.
    dairy_do_active: 'Activate',
    dairy_do_suspended: 'Suspend',
    dairy_do_terminated: 'Terminate',

    // Compliance
    dairy_compliance: 'Compliance',
    dairy_compliance_subtitle: 'FSSAI licence standing across every dairy outlet',
    dairy_refresh_statuses: 'Refresh statuses',
    dairy_expired: 'Expired',
    dairy_expiring: 'Expiring',
    dairy_stale_statuses: 'Stale statuses',
    dairy_no_licence: 'No licence on record',
    dairy_cache_stale: 'Stored status is out of date',
    dairy_cached_as: 'cached as',
    dairy_all_compliant: 'No licence is expiring in this window',
    dairy_compliance_pending: 'Pending',
    dairy_compliance_valid: 'Valid',
    dairy_compliance_expiring: 'Expiring',
    dairy_compliance_expired: 'Expired',
    th_warning_window: 'Warn within (days)',
    th_expires_on: 'Expires on',
    th_days_left: 'Days left',
    th_licence_number: 'Licence number',
    ph_days_hint: '1 to 365',
    th_apply: 'Apply',
    ts_refresh_compliance_title: 'Refresh all compliance statuses?',
    ts_refresh_compliance_instruction:
      'Every compliance record is re-evaluated against its dates and changed ones are written back',
    ts_yes_run_it: 'Yes, run it',
    ts_compliance_refreshed: 'Compliance statuses refreshed',
    ts_compliance_nothing_to_do: 'Every status was already up to date',

    // Catalog health
    dairy_catalog_health: 'Catalog health',
    dairy_health_orphans: 'Products with no category',
    dairy_health_sku_no_product: 'SKUs with no product',
    dairy_health_product_no_sku: 'Products with no SKU',
    dairy_health_ok: 'No problems found',
    dairy_health_issue: 'consistency issue(s)',
    dairy_products: 'Products',
    dairy_skus: 'SKUs',

    // Keys referenced by the screens that the earlier passes missed. Collected by
    // `scripts/check-dairy-i18n.js`, which is what found them.
    dairy_status: 'Current status',
    // `dairy_status_expired` is used by the compliance screen's status filter. The
    // franchise screen has its own `dairy_franchise_status_*` family, but the
    // compliance filter is built from the shared one.
    dairy_status_expired: 'Expired',
    dairy_change_status_title: 'Change settlement status',
    dairy_change_franchise_status_title: 'Change franchise status',
    search_by_name_or_address: 'Search by name or address'
  }
};

// English text stands in for the three locales until they are translated properly.
for (const lang of ['ar', 'es', 'hi']) {
  KEYS[lang] = KEYS.en;
}

const dir = path.join(__dirname, '..', 'src', 'assets', 'i18n');

for (const lang of ['en', 'ar', 'es', 'hi']) {
  const file = path.join(dir, `${lang}.json`);
  const raw = fs.readFileSync(file, 'utf8');
  const json = JSON.parse(raw);
  const before = Object.keys(json).length;

  // Assigned before the known block so the group sits together in the file.
  const merged = {};
  for (const [key, value] of Object.entries(KEYS[lang])) {
    merged[key] = value;
  }
  for (const [key, value] of Object.entries(json)) {
    merged[key] = value;
  }

  // Two-space indent matches the existing files; a trailing newline keeps
  // Prettier and git quiet.
  fs.writeFileSync(file, JSON.stringify(merged, null, 2) + '\n', 'utf8');
  console.log(`  ${lang}: ${before} -> ${Object.keys(merged).length} keys`);
}

// Prove the four files still agree, since nothing in the build enforces it.
const sets = ['en', 'ar', 'es', 'hi'].map((lang) => ({
  lang,
  keys: new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(dir, `${lang}.json`), 'utf8'))))
}));
const union = new Set();
for (const s of sets) {
  for (const k of s.keys) union.add(k);
}
for (const s of sets) {
  const missing = [...union].filter((k) => !s.keys.has(k));
  console.log(`  ${s.lang}: ${missing.length === 0 ? 'in sync' : missing.length + ' MISSING'}`);
}
