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

console.log('RESEND_API_KEY prefix:', env.RESEND_API_KEY ? env.RESEND_API_KEY.slice(0, 6) + '...' : 'NONE');
console.log('RESEND_API_KEY length:', env.RESEND_API_KEY ? env.RESEND_API_KEY.length : 0);
console.log('RESEND_FROM_EMAIL:', env.RESEND_FROM_EMAIL);
