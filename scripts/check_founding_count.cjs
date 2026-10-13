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

const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.log('No service role key found in .env');
  process.exit(0);
}

const target = new URL(`${url}/rest/v1/early_access_requests?select=id,is_verified,is_founding_50`);
const req = https.request(target, {
  method: 'GET',
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
}, (res) => {
  let raw = '';
  res.on('data', chunk => raw += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        const total = data.length;
        const verified = data.filter(d => d.is_verified).length;
        const founding50 = data.filter(d => d.is_founding_50).length;
        console.log('CURRENT_ALLOCATION_SUMMARY:', JSON.stringify({ totalWaitlist: total, verifiedCount: verified, founding50Allocated: founding50 }));
      } else {
        console.log('Status:', res.statusCode, 'Body:', data);
      }
    } catch (e) {
      console.log('Parse error:', e.message, 'Raw:', raw.slice(0, 100));
    }
  });
});

req.on('error', (err) => console.error('HTTPS req error:', err.message));
req.end();
