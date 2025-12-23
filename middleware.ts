import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')
  const { pathname } = request.nextUrl

  // If the user is already on the login page, let them stay there
  if (pathname === '/login') {
    // If they are already logged in, redirect to home
    if (authCookie?.value === 'true') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // If the user is not logged in and trying to access a protected route
  if (!authCookie || authCookie.value !== 'true') {
    // Allow access to public assets if needed, but generally we want to protect the app
    // We should exclude static files and api routes if they don't need auth, 
    // but for "simple as possible" protecting everything except login is safer.
    // However, next.js handles _next/static automatically usually, but let's be explicit about what we protect.
    
    // Protect the root route and any other routes that are not static assets
    if (!pathname.startsWith('/_next') && !pathname.includes('.')) {
       return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
