// ================================================================
// AXIOM -- Route protection middleware
// Handles: auth, subscription check, invalidated sessions
// ================================================================

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token    = req.nextauth.token as any
    const pathname = req.nextUrl.pathname

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Session was invalidated (another device logged in)
    if (token.error === "session_invalidated" || token.error === "invalid_session") {
      const url = new URL("/login", req.url)
      url.searchParams.set("motivo", "sessao_encerrada")
      return NextResponse.redirect(url)
    }

    const status   = (token.subscriptionStatus ?? "inactive") as string
    const isActive = status === "active" || status === "trialing"

    if (!isActive && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/planos", req.url))
    }

    // Redirect new users to tour on first dashboard visit
    // Skip if they just completed the tour (cookie set by tour/complete API)
    const justCompletedTour = req.cookies.get("axiom_tour_done")?.value === "1"
    if (isActive && pathname === "/dashboard" && !token.tourCompleted && !justCompletedTour) {
      return NextResponse.redirect(new URL("/tour", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/conta/:path*", "/tour"],
}
