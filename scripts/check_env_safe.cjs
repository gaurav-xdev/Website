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
console.log('ENV KEYS PRESENT:', Object.keys(env));
const url = env.VITE_SUPABASE_URL || '';
const anon = env.VITE_SUPABASE_ANON_KEY || '';
console.log('VITE_SUPABASE_URL set:', Boolean(url));
console.log('VITE_SUPABASE_URL startsWith http:', url.startsWith('http'));
console.log('VITE_SUPABASE_URL placeholder:', url.includes('your-project.supabase.co'));
console.log('VITE_SUPABASE_ANON_KEY set:', Boolean(anon));
console.log('VITE_SUPABASE_ANON_KEY length:', anon.length);
console.log('SUPABASE_URL (for serverless) set:', Boolean(env.SUPABASE_URL));
console.log('SUPABASE_SERVICE_ROLE_KEY set:', Boolean(env.SUPABASE_SERVICE_ROLE_KEY));
console.log('DODO_PAYMENTS_API_KEY set:', Boolean(env.DODO_PAYMENTS_API_KEY));
console.log('DODO_PAYMENTS_WEBHOOK_SECRET set:', Boolean(env.DODO_PAYMENTS_WEBHOOK_SECRET));
console.log('RESEND_API_KEY set:', Boolean(env.RESEND_API_KEY));
