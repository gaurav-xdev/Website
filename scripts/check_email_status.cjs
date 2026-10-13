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

fetch('https://api.resend.com/emails/01a130e8-bde3-7263-9e77-55f58bda160b', {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(r => r.json())
.then(res => {
  console.log('Email delivery status:', res);
})
.catch(e => console.error(e));
