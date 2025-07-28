// Simple test to check if environment variables are loaded
console.log('🔍 Testing environment variables...');
console.log('='.repeat(50));

// In Next.js, environment variables are automatically loaded
const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
const openaiKey = process.env.OPENAI_API_KEY;

console.log('GOOGLE_CREDENTIALS_BASE64 exists:', !!credentialsBase64);
console.log('GOOGLE_CREDENTIALS_BASE64 length:', credentialsBase64 ? credentialsBase64.length : 0);
console.log('OPENAI_API_KEY exists:', !!openaiKey);

if (credentialsBase64) {
  console.log('\n📋 First 50 chars of Base64:', credentialsBase64.substring(0, 50));
  console.log('📋 Last 50 chars of Base64:', credentialsBase64.substring(credentialsBase64.length - 50));
  
  // Check if it's the correct length (should be 3200)
  if (credentialsBase64.length === 3200) {
    console.log('✅ Base64 length is correct (3200 characters)');
  } else {
    console.log('❌ Base64 length is incorrect. Expected 3200, got:', credentialsBase64.length);
  }
  
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
} else {
  console.log('❌ GOOGLE_CREDENTIALS_BASE64 not found in environment variables');
  console.log('💡 Make sure your .env.local file exists and contains the variable');
}

console.log('='.repeat(50)); 