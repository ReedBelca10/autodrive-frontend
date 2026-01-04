import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protected routes that require specific roles
  const adminRoutes = pathname.startsWith('/admin');
  const managerRoutes = pathname.startsWith('/manager');

  if (adminRoutes || managerRoutes) {
    try {
      // Call the profile endpoint to check user role
      // Use the same origin as the request if available
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
      const profileRes = await fetch(`${baseUrl}/auth/profile`, {
        method: 'GET',
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
      });

      if (!profileRes.ok) {
        // Not authenticated, redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const profileData = await profileRes.json();
      const userRole = profileData.user?.role;

      // Check if user has permission for the route
      if (adminRoutes && userRole !== 'admin') {
        // Redirect to home if not admin
        return NextResponse.redirect(new URL('/', request.url));
      }

      if (managerRoutes && userRole !== 'manager') {
        // Redirect to home if not manager
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Allow access
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware error:', error);
      // On error, redirect to login to be safe
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*'],
};
