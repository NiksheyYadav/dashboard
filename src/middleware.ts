import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const roleMap: Record<string, string[]> = {
    "/dashboard": ["TEACHER", "MENTOR", "HOD", "DEAN", "ADMIN"],
    "/attendance": ["TEACHER", "HOD", "DEAN", "ADMIN"],
    "/mentee-monitor": ["MENTOR", "HOD", "DEAN", "ADMIN"],
    "/leave-arrangement": ["TEACHER", "HOD", "ADMIN"],
    "/extra-classes": ["TEACHER", "HOD", "ADMIN"],
    "/monitoring": ["HOD", "DEAN", "ADMIN"],
};

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const protectedRoute = Object.keys(roleMap).find((prefix) => path === prefix || path.startsWith(`${prefix}/`));
    if (!protectedRoute) {
        return NextResponse.next();
    }

    const accessCookie = request.cookies.get("access_token");
    if (!accessCookie) {
        const login = new URL("/login", request.url);
        return NextResponse.redirect(login);
    }

    const required = roleMap[protectedRoute];
    const token = accessCookie.value;
    const jwtSecret = process.env.JWT_ACCESS_SECRET;
    if (!jwtSecret) {
        if (process.env.NODE_ENV === "production") {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
    }
    try {
        const verified = await jwtVerify(token, new TextEncoder().encode(jwtSecret), {
            algorithms: ["HS256"],
            issuer: process.env.JWT_ISSUER || "attendance-backend",
        });
        const roles = Array.isArray(verified.payload.roles)
            ? verified.payload.roles.map((value) => String(value).toUpperCase())
            : [];
        if (required.length && roles.length && !roles.some((role) => required.includes(role))) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    } catch {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/attendance/:path*", "/mentee-monitor/:path*", "/leave-arrangement/:path*", "/extra-classes/:path*", "/monitoring/:path*"],
};
