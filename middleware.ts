import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/boards(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Clerk v6: auth() is async and protect() moved onto the auth helper itself
  // (was auth().protect() in v5).
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  // Skip Next.js internals and static assets by extension instead of excluding
  // every path containing a dot (which let dotted routes bypass Clerk entirely).
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
