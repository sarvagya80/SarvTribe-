// src/middleware.ts

export { default } from "next-auth/middleware";

export const config = {
  // The matcher specifies which routes the middleware should run on.
  // We are protecting the homepage ('/') in this case.
  matcher: ['/'],
};