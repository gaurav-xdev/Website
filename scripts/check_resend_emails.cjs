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
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('Resend recent emails sent:');
  if (data.data && Array.isArray(data.data)) {
    console.log(`Count: ${data.data.length}`);
    data.data.slice(0, 3).forEach(e => {
      console.log(`- To: ${e.to}, From: ${e.from}, Subject: ${e.subject}, Created: ${e.created_at}`);
    });
  } else {
    console.log(data);
  }
})
.catch(e => console.error(e));
