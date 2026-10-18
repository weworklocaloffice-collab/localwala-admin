/*
 * Every `appTranslate()` key used by the dairy screens must exist in all four locales.
 *
 * The panel has no type-checked i18n contract, so a typo in a key is not a build
 * error. `TranslateService.instant()` echoes an unknown key back as the key itself,
 * so the result is `dairy_verticals_title` rendered in the middle of the UI — which
 * looks like a broken page rather than a missing translation.
 *
 * That is invisible in a compile check, so it is checked here instead. The four
 * locale files are also compared against each other, since nothing in the build
 * keeps them in sync and a key added to `en` only is a runtime surprise in three
 * languages.
 *
 * Usage: `node scripts/check-dairy-i18n.js`
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const screensDir = path.join(root, 'src', 'app', 'pages', 'admin', 'dairy-management');
const i18nDir = path.join(root, 'src', 'assets', 'i18n');
const LOCALES = ['en', 'ar', 'es', 'hi'];

/** Every file under the dairy screens, recursively. */
const walk = (dir) => {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (/\.(ts|html)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
};

const locales = {};
for (const lang of LOCALES) {
  locales[lang] = JSON.parse(fs.readFileSync(path.join(i18nDir, `${lang}.json`), 'utf8'));
}

let failures = 0;
const check = (label, ok, detail) => {
  if (ok) {
    console.log(`  PASS  ${label}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
};

console.log('\n1. Every key referenced by the dairy screens exists');

const referenced = new Map();
for (const file of walk(screensDir)) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/appTranslate\(\s*'([^']+)'/g)) {
    if (!referenced.has(m[1])) {
      referenced.set(m[1], path.relative(root, file));
    }
  }
}

console.log(`         ${referenced.size} distinct keys across ${walk(screensDir).length} files`);

// Dynamic keys — built at runtime as `'dairy_status_' + row.status` — are matched
// as a bare prefix by the regex above and cannot be checked as a literal. They are
// verified as families in section 3 instead, so they are excluded here rather than
// reported as missing.
const dynamicPrefixes = [
  'dairy_status_',
  'dairy_franchise_status_',
  'dairy_compliance_',
  'dairy_type_',
  'dairy_payout_',
  'dairy_outlet_status_',
  'dairy_do_',
  'dairy_supply_',
  'dairy_on_',
  'dairy_basis_',
  'dairy_period_',
];

const missingEn = [...referenced.keys()].filter(
  (key) => !(key in locales.en) && !dynamicPrefixes.includes(key)
);
check('no dairy screen references a key missing from en.json', missingEn.length === 0,
  missingEn.map((k) => `${k} (${referenced.get(k)})`).join(', '));

console.log('\n2. The four locale files agree');

const unions = {};
for (const lang of LOCALES) {
  const keys = new Set(Object.keys(locales[lang]));
  const union = new Set();
  for (const l of LOCALES) {
    for (const k of Object.keys(locales[l])) {
      union.add(k);
    }
  }
  unions[lang] = [...union].filter((k) => !keys.has(k));
}
for (const lang of LOCALES) {
  check(`${lang}.json has every key (${Object.keys(locales[lang]).length})`,
    unions[lang].length === 0,
    `${unions[lang].length} missing: ${unions[lang].slice(0, 5).join(', ')}`);
}

console.log('\n3. The dynamic key families are all populated');

const withFamily = (prefix, suffixes) =>
  suffixes.every((s) => `${prefix}${s}` in locales.en);

check('dairy_status_* covers every status', withFamily('dairy_status_',
  ['pending', 'approved', 'rejected', 'active', 'suspended', 'terminated',
    'draft', 'submitted', 'disputed', 'paid', 'void', 'expired']));
check('dairy_franchise_status_* covers every franchise status', withFamily('dairy_franchise_status_',
  ['pending', 'active', 'suspended', 'expired', 'terminated']));
check('dairy_compliance_* covers every derived status', withFamily('dairy_compliance_',
  ['pending', 'valid', 'expiring', 'expired']));
check('dairy_type_* covers the settlement types', withFamily('dairy_type_',
  ['commission', 'franchise', 'partner', 'franchisee']));
check('dairy_payout_* covers the payout modes', withFamily('dairy_payout_',
  ['platform_pays', 'business_pays']));
check('dairy_outlet_status_* covers the outlet statuses', withFamily('dairy_outlet_status_',
  ['pending', 'active', 'suspended', 'terminated']));
check('dairy_supply_* covers the supply models', withFamily('dairy_supply_',
  ['platform_supplied', 'local_procurement', 'mixed']));
check('dairy_on_* covers the commission bases', withFamily('dairy_on_',
  ['product_only', 'product_and_delivery']));
check('dairy_basis_* covers the commission bases', withFamily('dairy_basis_',
  ['product_only', 'product_and_delivery']));
check('dairy_period_* covers the settlement periods', withFamily('dairy_period_',
  ['daily', 'weekly', 'monthly']));
check('dairy_do_* covers every transition the screens offer', withFamily('dairy_do_',
  ['submitted', 'approved', 'draft', 'disputed', 'void', 'active', 'suspended', 'terminated']));

console.log(`\n         dynamic families checked as families: ${dynamicPrefixes.join(', ')}`);

console.log(
  failures === 0
    ? '\nALL DAIRY I18N CHECKS PASSED'
    : `\n${failures} CHECK(S) FAILED`
);
process.exit(failures === 0 ? 0 : 1);