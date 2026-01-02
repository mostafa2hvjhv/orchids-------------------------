import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/store-owner-login(.*)",
  "/store-registration(.*)",
  "/store/(.*)",
  "/api/webhook/stripe(.*)",
  "/sso-callback(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const url = new URL(request.url);
  console.log(`Middleware processing path: ${url.pathname}`);
  
  if (!isPublicRoute(request)) {
    console.log(`Protecting private route: ${url.pathname}`);
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
