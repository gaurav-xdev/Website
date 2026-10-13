const fs = require('fs');
const https = require('https');

const content = fs.readFileSync('.env', 'utf8');
const env = {};
content.split('\n').forEach(line => {
  const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)?$/);
  if (match) {
    let val = (match[2] || '').trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1]] = val;
  }
});

const url = env.VITE_SUPABASE_URL || '';
const anon = env.VITE_SUPABASE_ANON_KEY || '';
const parsed = new URL(url + '/auth/v1/settings');

https.get(parsed, {
  headers: {
    'apikey': anon,
    'Authorization': 'Bearer ' + anon
  }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('external.email:', json.external ? json.external.email : null);
    console.log('disable_signup:', json.disable_signup);
    console.log('mailer_autoconfirm:', json.mailer_autoconfirm);
    console.log('full settings:', JSON.stringify(json, null, 2));
  });
});
