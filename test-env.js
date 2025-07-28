// Test script to verify environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing environment variables...');
console.log('='.repeat(50));

const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
const openaiKey = process.env.OPENAI_API_KEY;

console.log('GOOGLE_CREDENTIALS_BASE64 exists:', !!credentialsBase64);
console.log('GOOGLE_CREDENTIALS_BASE64 length:', credentialsBase64 ? credentialsBase64.length : 0);
console.log('OPENAI_API_KEY exists:', !!openaiKey);

if (credentialsBase64) {
  console.log('\n📋 First 50 chars of Base64:', credentialsBase64.substring(0, 50));
  console.log('📋 Last 50 chars of Base64:', credentialsBase64.substring(credentialsBase64.length - 50));
  
  try {
    const decoded = Buffer.from(credentialsBase64, 'base64').toString();
    const parsed = JSON.parse(decoded);
    console.log('✅ Base64 decoding successful!');
    console.log('✅ JSON parsing successful!');
    console.log('📋 Project ID:', parsed.project_id);
    console.log('📋 Client Email:', parsed.client_email);
  } catch (error) {
    console.log('❌ Error decoding/parsing:', error.message);
  }
}

console.log('='.repeat(50)); 