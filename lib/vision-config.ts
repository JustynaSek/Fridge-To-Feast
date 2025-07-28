import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export function setupVisionCredentials() {
  // Jeśli mamy base64 credentials (produkcja/Vercel)
  if (process.env.VISION_SERVICE_ACCOUNT_BASE64) {
    const credentialsPath = '/tmp/vision-service-account.json';
    
    // Zapisz credentials do pliku tymczasowego
    writeFileSync(
      credentialsPath,
      Buffer.from(process.env.VISION_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')
    );
    
    // Ustaw zmienną środowiskową
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
    return;
  }

  // Jeśli mamy ścieżkę do pliku (lokalnie)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Sprawdź czy plik istnieje
    if (existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      return; // Plik istnieje, wszystko OK
    }
  }

  // Jeśli nie mamy żadnych credentials, użyj domyślnych (jeśli są dostępne)
  const defaultPath = join(process.cwd(), 'vision-service-account.json');
  if (existsSync(defaultPath)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = defaultPath;
    return;
  }

  // Jeśli nie mamy żadnych credentials, wyrzuć błąd
  throw new Error(
    'Google Vision API credentials not found. Please set either:\n' +
    '- VISION_SERVICE_ACCOUNT_BASE64 (for production)\n' +
    '- GOOGLE_APPLICATION_CREDENTIALS (for local development)\n' +
    '- Or place vision-service-account.json in project root'
  );
} 