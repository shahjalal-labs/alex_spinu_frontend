import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Your app uses a custom 'token' cookie for all users
  const token = request.cookies.get('token')?.value;

  // We are already filtering out public routes using the `matcher` below.
  // So any route that hits this code is considered "protected".
  if (!token) {
    // Redirect them to the login page and save where they were trying to go
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  // - auth pages (login, register, forgot-password, reset-password, verify-otp)
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|forgot-password|reset-password|verify-otp).*)',
  ],
};
