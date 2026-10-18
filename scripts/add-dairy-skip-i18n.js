const fs = require('fs');
const path = require('path');
const dir = path.resolve(__dirname, '..', 'src', 'assets', 'i18n');
const A = '  "dairy_self_registration_hint":';
const S = {
  en: {
    dairy_subscription_skip_cutoff_hours: 'Subscription skip cutoff (hours)',
    dairy_subscription_skip_cutoff_hours_hint:
      'With the default 06:00 slot, 9 hours makes 21:00 the previous evening the last time a skip is accepted.',
    dairy_subscription_skip_cutoff_hours_min: 'Enter 0 or more',
    dairy_subscription_skip_cutoff_hours_max: 'Enter 48 hours or fewer',
  },
  ar: {
    dairy_subscription_skip_cutoff_hours: 'مهلة تخطي الاشتراك (ساعات)',
    dairy_subscription_skip_cutoff_hours_hint:
      'مع النافذة الافتراضية 06:00، تساوي 9 ساعات الساعة 21:00 من المساء كآخر وقت لقبول التخطي.',
    dairy_subscription_skip_cutoff_hours_min: 'أدخل 0 أو أكثر',
    dairy_subscription_skip_cutoff_hours_max: 'أدخل 48 ساعة أو أقل',
  },
  es: {
    dairy_subscription_skip_cutoff_hours: 'Plazo de cancelación de suscripción (horas)',
    dairy_subscription_skip_cutoff_hours_hint:
      'Con el horario predeterminado de 06:00, 9 horas hacen las 21:00 de la tarde como última aceptación.',
    dairy_subscription_skip_cutoff_hours_min: 'Ingresa 0 o más',
    dairy_subscription_skip_cutoff_hours_max: 'Ingresa 48 horas o menos',
  },
  hi: {
    dairy_subscription_skip_cutoff_hours: 'सब्सक्रिप्शन स्किप समय सीमा (घंटे)',
    dairy_subscription_skip_cutoff_hours_hint:
      'डिफ़ॉल्ट 06:00 स्लॉट के साथ, 9 घंटे का मतलब पिछले दिन शाम 21:00 तक ही स्किप स्वीकार होगी।',
    dairy_subscription_skip_cutoff_hours_min: '0 या उससे अधिक दर्ज करें',
    dairy_subscription_skip_cutoff_hours_max: '48 घंटे या उससे कम दर्ज करें',
  },
};
for (const [l, obj] of Object.entries(S)) {
  const f = path.join(dir, `${l}.json`);
  let t = fs.readFileSync(f, 'utf8');
  const d = JSON.parse(t);
  const pend = Object.entries(obj).filter(([k]) => d[k] === undefined);
  if (!pend.length) { console.log(`${l}: complete`); continue; }
  const at = t.indexOf(A);
  const eol = t.indexOf('\n', at);
  const blk = pend.map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join('\n');
  t = `${t.slice(0, eol + 1)}${blk}\n${t.slice(eol + 1)}`;
  fs.writeFileSync(f, t, 'utf8');
  console.log(`${l}: added ${pend.length}`);
}
