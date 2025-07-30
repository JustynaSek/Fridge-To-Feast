git import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export function setupVisionCredentials() {
  // Check if we have GOOGLE_APPLICATION_CREDENTIALS set
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // If it's a file path, check if the file exists
    if (existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      return; // File exists, everything OK
    }
    
    // If it's not a file path, it might be the JSON content directly
    // Try to parse it as JSON and create a temporary file
    try {
      const credentialsPath = '/tmp/vision-service-account.json';
      writeFileSync(credentialsPath, process.env.GOOGLE_APPLICATION_CREDENTIALS);
      process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
      return;
    } catch {
      // If parsing fails, continue to next check
    }
  }

  // Check for default service account file in project root
  const defaultPath = join(process.cwd(), 'vision-service-account.json');
  if (existsSync(defaultPath)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = defaultPath;
    return;
  }

  // If no credentials found, throw error
  throw new Error(
    'Google Vision API credentials not found. Please set either:\n' +
    '- GOOGLE_APPLICATION_CREDENTIALS (file path or JSON content)\n' +
    '- Or place vision-service-account.json in project root'
  );
} 