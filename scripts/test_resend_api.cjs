const fs = require('fs');

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

const apiKey = env.RESEND_API_KEY;

fetch('https://api.resend.com/api-keys', {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('Resend API Key check:', data.data ? 'Valid Key' : data);
  return fetch('https://api.resend.com/domains', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
})
.then(r => r.json())
.then(domains => {
  console.log('Resend Domains configured:', domains);
})
.catch(e => console.error('Error querying Resend:', e.message));
