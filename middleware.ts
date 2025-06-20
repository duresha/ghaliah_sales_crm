import { NextResponse } from 'next/server'
import { withAuth } from "next-auth/middleware"

// This function can be marked `async` if using `await` inside
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    
    // Already logged in, trying to access login page, redirect to dashboard
    if (pathname === '/' && req.nextauth.token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow public routes even when not logged in
        if (pathname === '/' || pathname === '/about' || pathname.startsWith('/api/auth')) {
          return true
        }
        
        // Require authentication for all other routes
        return !!token
      },
    },
    pages: {
      signIn: '/',
    }
  },
)

export const config = {
  // Match all paths except for:
  // - API routes that don't need auth
  // - Static files paths
  // - Public asset paths
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)'
  ],
}
