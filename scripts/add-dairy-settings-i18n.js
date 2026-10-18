/**
 * One-off: adds the `dairy_settings` tab strings to every admin locale.
 *
 * Textual insertion rather than a JSON round-trip, because rewriting the file
 * through `JSON.parse`/`stringify` would reorder every key in a 2,990-line file and
 * bury the real change in noise. Each key is inserted after `deliveryman_settings`
 * so the dairy settings strings sit next to the vertical settings block they
 * extend.
 *
 * Idempotent: a key that already exists is left alone.
 */

const fs = require('fs');
const path = require('path');

const I18N_DIR = path.resolve(__dirname, '..', 'src', 'assets', 'i18n');
const ANCHOR = '  "deliveryman_settings":';

const STRINGS = {
  en: {
    dairy_settings: 'Dairy Settings',
    dairy_settings_operational: 'Operational settings',
    dairy_settings_operational_hint:
      'These are enforced immediately. Saving a change takes effect on the next request that reads it.',
    dairy_fefo_warning_days: 'Licence expiry warning (days)',
    dairy_fefo_warning_days_hint:
      'An outlet licence is treated as expiring this many days before it actually expires.',
    dairy_fefo_warning_days_min: 'Enter at least 1 day',
    dairy_fefo_warning_days_max: 'Enter 365 days or fewer',
    dairy_settings_platform: 'Platform settings',
    dairy_settings_platform_hint:
      'Stored for consistency with the other verticals. Anything not yet enforced by the platform is marked below.',
    dairy_self_registration: 'Allow self-registration',
    dairy_self_registration_hint:
      'Not yet enforced. Dairy outlet registration is currently always open.',
    ts_dairy_setting_saved: 'Dairy settings saved successfully',
    ts_dairy_setting_updated: 'Dairy settings updated successfully',
  },
  ar: {
    dairy_settings: 'إعدادات الألبان',
    dairy_settings_operational: 'الإعدادات التشغيلية',
    dairy_settings_operational_hint:
      'يتم تطبيق هذه الإعدادات فوراً. يسري التغيير عند الطلب التالي الذي يقرأه.',
    dairy_fefo_warning_days: 'تحذير انتهاء الترخيص (بالأيام)',
    dairy_fefo_warning_days_hint:
      'يعتبر ترخيص المنتهي قرب الانتهاء قبل هذا العدد من الأيام.',
    dairy_fefo_warning_days_min: 'أدخل يوماً واحداً على الأقل',
    dairy_fefo_warning_days_max: 'أدخل 365 يوماً أو أقل',
    dairy_settings_platform: 'إعدادات المنصة',
    dairy_settings_platform_hint:
      'محفوظة لتتوافق مع القطاعات الأخرى. ما لم تفرضه المنصة بعد مُوضَّح أدناه.',
    dairy_self_registration: 'السماح بالتسجيل الذاتي',
    dairy_self_registration_hint: 'غير مفروض بعد. تسجيل منافذ الألبان مفتوح دائماً حالياً.',
    ts_dairy_setting_saved: 'تم حفظ إعدادات الألبان بنجاح',
    ts_dairy_setting_updated: 'تم تحديث إعدادات الألبان بنجاح',
  },
  es: {
    dairy_settings: 'Configuración de Lácteos',
    dairy_settings_operational: 'Configuración operativa',
    dairy_settings_operational_hint:
      'Se aplican de inmediato. El cambio surte efecto en la siguiente solicitud que lo lea.',
    dairy_fefo_warning_days: 'Aviso de vencimiento de licencia (días)',
    dairy_fefo_warning_days_hint:
      'La licencia de una tienda se considera próxima a vencer esta cantidad de días antes de vencerse.',
    dairy_fefo_warning_days_min: 'Ingresa al menos 1 día',
    dairy_fefo_warning_days_max: 'Ingresa 365 días o menos',
    dairy_settings_platform: 'Configuración de plataforma',
    dairy_settings_platform_hint:
      'Se guarda por coherencia con los demás verticales. Lo que la plataforma aún no aplica se indica abajo.',
    dairy_self_registration: 'Permitir autorregistro',
    dairy_self_registration_hint:
      'Aún no se aplica. El registro de tiendas lecheras está abierto siempre por ahora.',
    ts_dairy_setting_saved: 'Configuración de lácteos guardada correctamente',
    ts_dairy_setting_updated: 'Configuración de lácteos actualizada correctamente',
  },
  hi: {
    dairy_settings: 'डेयरी सेटिंग्स',
    dairy_settings_operational: 'परिचालन सेटिंग्स',
    dairy_settings_operational_hint:
      'ये तुरंत लागू होती हैं। बदलाव अगली अनुरोध पर लागू होगा जो इन्हें पढ़ेगी।',
    dairy_fefo_warning_days: 'लाइसेंस समाप्ति चेतावनी (दिन)',
    dairy_fefo_warning_days_hint:
      'आउटलेट का लाइसेंस असल में समाप्त होने से इतने दिन पहले उसे "समाप्त होने वाला" माना जाता है।',
    dairy_fefo_warning_days_min: 'कम से कम 1 दिन दर्ज करें',
    dairy_fefo_warning_days_max: '365 दिन या उससे कम दर्ज करें',
    dairy_settings_platform: 'प्लेटफ़ॉर्म सेटिंग्स',
    dairy_settings_platform_hint:
      'अन्य क्षेत्रों के अनुरूप रखने के लिए संग्रहीत। जो प्लेटफ़ॉर्म अभी लागू नहीं करता, वह नीचे बताया गया है।',
    dairy_self_registration: 'स्वयं पंजीकरण की अनुमति दें',
    dairy_self_registration_hint:
      'अभी लागू नहीं है। डेयरी आउटलेट पंजीकरण वर्तमान में हमेशा खुला है।',
    ts_dairy_setting_saved: 'डेयरी सेटिंग्स सफलतापूर्वक सहेजी गईं',
    ts_dairy_setting_updated: 'डेयरी सेटिंग्स सफलतापूर्वक अपडेट की गईं',
  },
};

let changed = 0;

for (const [locale, strings] of Object.entries(STRINGS)) {
  const file = path.join(I18N_DIR, `${locale}.json`);

  let text = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(text); // fail fast on a malformed file

  const pending = Object.entries(strings).filter(([key]) => data[key] === undefined);
  if (pending.length === 0) {
    console.log(`${locale}: already complete`);
    continue;
  }

  const anchorAt = text.indexOf(ANCHOR);
  if (anchorAt === -1) {
    throw new Error(`${locale}: anchor ${ANCHOR.trim()} not found`);
  }
  const lineEnd = text.indexOf('\n', anchorAt);
  if (lineEnd === -1) {
    throw new Error(`${locale}: anchor has no terminating newline`);
  }

  const block = pending
    .map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`)
    .join('\n');

  text = `${text.slice(0, lineEnd + 1)}${block}\n${text.slice(lineEnd + 1)}`;
  fs.writeFileSync(file, text, 'utf8');
  changed += 1;
  console.log(`${locale}: inserted ${pending.length} key(s)`);
}

console.log(`\n${changed} locale file(s) updated`);