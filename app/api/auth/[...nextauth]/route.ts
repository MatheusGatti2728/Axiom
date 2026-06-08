import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",  type: "email"    },
        password: { label: "Senha",  type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const bcrypt               = await import("bcryptjs")
          const { getUserByEmail }   = await import("@/lib/auth/users")
          const { setActiveSession } = await import("@/lib/auth/db")
          const { randomUUID }       = await import("crypto")

          const user = await getUserByEmail(credentials.email)
          if (!user) {
            console.error("[authorize] user not found:", credentials.email)
            return null
          }

          const ok = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!ok) {
            console.error("[authorize] wrong password for:", credentials.email)
            return null
          }

          const sessionToken = randomUUID()

          // Only enforce single-session for paying customers
          // Internal team members can use simultaneously
          if (!user.internalAccess) {
            await setActiveSession(user.id, sessionToken)
          }

          const effectiveStatus = user.internalAccess
            ? "active"
            : user.subscriptionStatus ?? "inactive"

          return {
            id:                 user.id,
            email:              user.email,
            name:               user.name,
            subscriptionStatus: effectiveStatus,
            planId:             user.planId ?? "core",
            stripeCustomerId:   user.stripeCustomerId ?? "",
            internalAccess:     user.internalAccess ?? false,
            role:               user.role ?? "user",
            sessionToken:       user.internalAccess ? "" : sessionToken,
            tourCompleted:      (user as any).tourCompleted ?? false,
          }
        } catch (err) {
          console.error("[authorize]", err)
          return null
        }
      },
    }),
  ],

  session: { strategy: "jwt", maxAge: 31 * 24 * 60 * 60 },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id                 = user.id
        token.subscriptionStatus = (user as any).subscriptionStatus ?? "inactive"
        token.planId             = (user as any).planId ?? "core"
        token.stripeCustomerId   = (user as any).stripeCustomerId ?? ""
        token.sessionToken       = (user as any).sessionToken ?? ""
        token.internalAccess     = (user as any).internalAccess ?? false
        token.role               = (user as any).role ?? "user"
        token.tourCompleted      = (user as any).tourCompleted ?? false
      }
      return token
    },

    async session({ session, token }) {
      if (!token.id) return { ...session, error: "invalid_session" }

      // Internal team: skip session uniqueness (they can use simultaneously)
      // Paying customers: enforce single active session (prevents sharing)
      const isInternal = token.internalAccess === true

      if (token.sessionToken && !isInternal) {
        try {
          const { getActiveSession } = await import("@/lib/auth/db")
          const activeToken = await getActiveSession(token.id as string)
          if (activeToken && activeToken !== token.sessionToken) {
            return { ...session, error: "session_invalidated" }
          }
        } catch {
          // Redis down - fail open
        }
      }

      if (session.user) {
        (session.user as any).id                 = token.id
        ;(session.user as any).subscriptionStatus = token.subscriptionStatus ?? "inactive"
        ;(session.user as any).planId             = token.planId ?? "core"
        ;(session.user as any).stripeCustomerId   = token.stripeCustomerId ?? ""
        ;(session.user as any).sessionToken       = token.sessionToken ?? ""
        ;(session.user as any).internalAccess     = token.internalAccess ?? false
        ;(session.user as any).role               = token.role ?? "user"
        ;(session.user as any).tourCompleted      = token.tourCompleted ?? false
      }
      return session
    },
  },

  pages:  { signIn: "/login", error: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
