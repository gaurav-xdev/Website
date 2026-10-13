const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

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

const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

console.log('Sending test OTP request to Supabase Auth...');
client.auth.signInWithOtp({
  email: 'testuser@gmail.com',
  options: {
    shouldCreateUser: true
  }
}).then(res => {
  console.log('OTP response data:', res.data);
  if (res.error) {
    console.log('OTP response error:', { message: res.error.message, status: res.error.status });
  } else {
    console.log('OTP dispatched successfully without error!');
  }
}).catch(err => {
  console.error('OTP unexpected throw:', err);
});
