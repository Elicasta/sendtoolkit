import { NextRequest, NextResponse } from "next/server";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.get("st_attribution")) {
    const attribution = new URLSearchParams();
    for (const key of UTM_KEYS) {
      const value = request.nextUrl.searchParams.get(key);
      if (value) attribution.set(key, value.slice(0, 160));
    }
    attribution.set("landing_path", request.nextUrl.pathname);

    if ([...attribution.keys()].some((key) => key !== "landing_path")) {
      response.cookies.set("st_attribution", attribution.toString(), {
        httpOnly: true,
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
        path: "/",
        maxAge: 60 * 60 * 24 * 90
      });
    }
  }

  const ref = request.nextUrl.searchParams.get("ref");
  if (ref && /^[a-zA-Z0-9_-]{1,64}$/.test(ref)) {
    response.cookies.set("st_ref", ref, {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 24 * 60
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)"]
};
