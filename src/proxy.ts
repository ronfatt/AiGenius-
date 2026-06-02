import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { demoAuthCookieName, isDemoLoginEnabled, isUserRole } from "@/lib/demo-auth";
import type { UserRole } from "@/lib/types";

const roleRoutes: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/teacher", roles: ["teacher", "admin"] },
  { prefix: "/students", roles: ["teacher", "admin"] },
  { prefix: "/classes", roles: ["teacher", "admin"] },
  { prefix: "/tasks", roles: ["teacher", "admin"] },
  { prefix: "/student", roles: ["student", "admin"] },
  { prefix: "/parent", roles: ["parent", "admin"] },
];

function redirectWithError(request: NextRequest, path: string, message: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = `?error=${encodeURIComponent(message)}`;
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const matchedRoute = roleRoutes.find((route) => pathname.startsWith(route.prefix));

  if (!matchedRoute || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const demoRole = isDemoLoginEnabled()
    ? request.cookies.get(demoAuthCookieName)?.value
    : undefined;
  if (isUserRole(demoRole)) {
    if (matchedRoute.roles.includes(demoRole)) {
      return NextResponse.next();
    }

    return redirectWithError(
      request,
      demoRole === "admin" ? "/admin/login" : "/login",
      "You do not have access to that portal.",
    );
  }

  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response = NextResponse.next({ request });
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectWithError(
      request,
      matchedRoute.prefix === "/admin" ? "/admin/login" : "/login",
      "Please login first.",
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: UserRole }>();

  if (!profile) {
    return redirectWithError(request, "/login", "Profile not found.");
  }

  if (!matchedRoute.roles.includes(profile.role)) {
    return redirectWithError(
      request,
      profile.role === "admin" ? "/admin/login" : "/login",
      "You do not have access to that portal.",
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/students/:path*",
    "/classes/:path*",
    "/tasks/:path*",
    "/student/:path*",
    "/parent/:path*",
  ],
};
