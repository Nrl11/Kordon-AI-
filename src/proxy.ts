import { NextResponse, type NextRequest } from "next/server";

/* Домен в верхнем регистре (KORDON.RU) — постоянный редирект на нижний,
   чтобы у главной не было дубля в поиске. */
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
  /* только страницы: статику, картинки и служебные файлы не трогаем */
  matcher: ["/((?!_next/static|_next/image|api|og/|clients/|team/|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)"],
};
