import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const cookies = req.headers.get("cookie");

  const isAdminLoggedIn = cookies && cookies.includes("adminToken=");

  if (pathname === "/admin-dashboard" && !isAdminLoggedIn) {
    return NextResponse.redirect(new URL("/admin-login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-dashboard"],
};
