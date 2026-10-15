import { NextResponse, type NextRequest } from "next/server";

/* An upper-case host (EXAMPLE.COM) gets a permanent redirect to lower case,
   so the home page has no duplicate in search. */
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host !== host.toLowerCase()) {
    const url = request.nextUrl.clone();
    url.host = host.toLowerCase();
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  /* pages only: static assets, images and service files are left alone */
  matcher: ["/((?!_next/static|_next/image|api|og/|clients/|team/|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)"],
};
