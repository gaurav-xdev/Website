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

fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    from: 'onboarding@resend.dev',
    to: 'delivered@resend.dev',
    subject: 'OSMOO Email Pipeline Test',
    text: 'Test email from OSMOO verification system test suite.'
  })
})
.then(r => r.json())
.then(res => {
  console.log('Test send result to delivered@resend.dev:', res);
})
.catch(e => console.error(e));
