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

console.log('Testing Supabase Auth API URL:', url ? url.slice(0, 25) + '...' : 'NONE');

if (!url || !anon) {
  console.log('Missing url or anon key');
  process.exit(1);
}

const parsed = new URL(url + '/auth/v1/settings');

const req = https.request(parsed, {
  method: 'GET',
  headers: {
    'apikey': anon,
    'Authorization': 'Bearer ' + anon
  }
}, (res) => {
  console.log('STATUS:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('BODY keys:', Object.keys(json));
      if (json.msg || json.message || json.error) console.log('ERROR/MSG:', json.msg || json.message || json.error);
      else console.log('Settings fetched successfully, external_providers:', Object.keys(json.external || {}));
    } catch(e) {
      console.log('RAW BODY (first 100 chars):', data.slice(0, 100));
    }
  });
});

req.on('error', (e) => console.log('REQ ERROR:', e.message));
req.end();
