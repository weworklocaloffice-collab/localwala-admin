/*
 * Applies the dairy translations to ar / es / hi, and reports coverage.
 *
 * en.json is never written to: `UtilService.tErrorTranslate` reverse-searches its
 * values to recover the key behind a raw English API error, so translating them
 * would break every API error message in the panel.
 *
 * Idempotent — running it twice changes nothing.
 *
 * Usage: `node scripts/apply-dairy-translations.js [--dry]`
 */

const fs = require('fs');
const path = require('path');
const { AR, ES, HI } = require('./dairy-translations.js');

const DRY = process.argv.includes('--dry');
const i18nDir = path.join(__dirname, '..', 'src', 'assets', 'i18n');

const en = JSON.parse(fs.readFileSync(path.join(i18nDir, 'en.json'), 'utf8'));

/** The dairy scope, plus the generic table/form keys the dairy screens reuse. */
const DAIRY_SCOPE =
  /^(dairy_|ts_dairy|ts_outlet|ts_franchise|ts_settle|ts_approve|ts_reject|ts_terminate|ts_suspend|ts_reactivate|ts_generate|ts_void|ts_pay_|ts_change|th_outlet|th_location|th_applicant|th_commission|th_revenue|th_supply|th_territory|th_operator|th_franchise|th_joining|th_net|th_period|th_settlement|th_party|th_rate|th_type|th_count|th_reference|th_start|th_end|th_minimum|th_payout|th_account|th_ifsc|th_upi|th_last|th_licence|th_expires|th_days|th_warning)/;

const MAPS = { ar: AR, es: ES, hi: HI };
let failures = 0;

console.log(`\nDairy translations${DRY ? ' (dry run)' : ''}\n`);

for (const [lang, map] of Object.entries(MAPS)) {
  const file = path.join(i18nDir, `${lang}.json`);
  const locale = JSON.parse(fs.readFileSync(file, 'utf8'));

  // Every dairy key currently sitting in English, plus any already-translated one.
  const keys = Object.keys(en).filter((k) => DAIRY_SCOPE.test(k));

  const missing = keys.filter((k) => en[k] !== en[k] && !(en[k] in map));

  // The map is keyed by English *values*, so "unused" means the string is not a
  // value anywhere in en.json. Checking it as a key would report every entry as
  // unused.
  const englishValues = new Set(Object.values(en));
  const unused = Object.keys(map).filter((value) => !englishValues.has(value));

  let applied = 0;
  for (const k of keys) {
    const english = en[k];
    if (english === undefined || !(english in map)) continue;
    if (locale[k] === map[english]) continue;
    locale[k] = map[english];
    applied += 1;
  }

  const stillEnglish = keys.filter((k) => locale[k] === en[k]);

  console.log(`  ${lang}`);
  console.log(`    keys in scope      ${keys.length}`);
  console.log(`    applied now        ${applied}`);
  console.log(`    missing translation${missing.length ? ` ${missing.length}` : ''}`);
  console.log(`    still English      ${stillEnglish.length}`);
  if (unused.length) {
    console.log(`    map entries not in en.json: ${unused.length}`);
    unused.slice(0, 5).forEach((u) => console.log(`      ${JSON.stringify(u)}`));
  }
  if (missing.length) {
    console.log('    missing (first 8):');
    missing.slice(0, 8).forEach((k) => console.log(`      ${k} = ${JSON.stringify(en[k])}`));
  }

  if (!DRY && applied > 0) {
    fs.writeFileSync(file, JSON.stringify(locale, null, 2) + '\n', 'utf8');
    console.log('    written');
  }
  console.log('');

  if (missing.length) failures += 1;
}

console.log(
  failures === 0
    ? 'EVERY DAIRY KEY IS TRANSLATED IN ALL THREE LOCALES'
    : `${failures} locale(s) have missing translations`
);
process.exit(failures === 0 ? 0 : 1);