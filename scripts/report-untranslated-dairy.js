/*
 * Reports which dairy keys are still showing English in ar / es / hi.
 *
 * Some are correct — `IFSC`, `UPI ID` and `SKU` are the same in every language, and
 * translating them would be wrong. The question is whether the remainder are
 * *deliberately* identical or simply unfinished, so each is printed with its English
 * value for a human to judge rather than reported as a bare count.
 */

const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, '..', 'src', 'assets', 'i18n');
const en = JSON.parse(fs.readFileSync(path.join(i18nDir, 'en.json'), 'utf8'));

const DAIRY_SCOPE =
  /^(dairy_|ts_dairy|ts_outlet|ts_franchise|ts_settle|ts_approve|ts_reject|ts_terminate|ts_suspend|ts_reactivate|ts_generate|ts_void|ts_pay_|ts_change|th_outlet|th_location|th_applicant|th_commission|th_revenue|th_supply|th_territory|th_operator|th_franchise|th_joining|th_net|th_period|th_settlement|th_party|th_rate|th_type|th_count|th_reference|th_start|th_end|th_minimum|th_payout|th_account|th_ifsc|th_upi|th_last|th_licence|th_expires|th_days|th_warning)/;

/** Identical across languages by design: acronyms and technical identifiers. */
const UNTRANSLATABLE = new Set(['IFSC', 'UPI ID', 'SKUs', 'SKU']);

const keys = Object.keys(en).filter((k) => DAIRY_SCOPE.test(k));

console.log(`\nDairy keys still showing English (of ${keys.length})\n`);

let suspect = 0;
for (const lang of ['ar', 'es', 'hi']) {
  const locale = JSON.parse(fs.readFileSync(path.join(i18nDir, `${lang}.json`), 'utf8'));
  const english = keys.filter((k) => locale[k] === en[k]);

  const byDesign = english.filter((k) => UNTRANSLATABLE.has(en[k]));
  const unexpected = english.filter((k) => !UNTRANSLATABLE.has(en[k]));

  console.log(`  ${lang}: ${english.length} identical` +
    `  (${byDesign.length} by design, ${unexpected.length} unexpected)`);
  for (const k of unexpected) {
    console.log(`      ${k} = ${JSON.stringify(en[k])}`);
  }
  suspect += unexpected.length;
}

console.log('');
if (suspect === 0) {
  console.log('  Every dairy string is translated, except the acronyms that should not be.');
} else {
  console.log(`  ${suspect} string(s) still need attention.`);
}
process.exit(suspect === 0 ? 0 : 1);