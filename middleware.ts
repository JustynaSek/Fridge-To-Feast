import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the pathname is a language route (e.g., /pl, /es, /fr, etc.)
  const languageRoutes = ['/pl', '/es', '/fr', '/de', '/it', '/pt'];
  
  if (languageRoutes.includes(pathname)) {
    // Redirect to the main page
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/pl', '/es', '/fr', '/de', '/it', '/pt'],
}; 