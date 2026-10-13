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

const postData = JSON.stringify({
  email: 'testuser@gmail.com',
  create_user: true
});

const parsed = new URL(url + '/auth/v1/otp');

const req = https.request(parsed, {
  method: 'POST',
  headers: {
    'apikey': anon,
    'Authorization': 'Bearer ' + anon,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  console.log('STATUS:', res.statusCode);
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('BODY:', data);
  });
});

req.on('error', e => console.error(e));
req.write(postData);
req.end();
