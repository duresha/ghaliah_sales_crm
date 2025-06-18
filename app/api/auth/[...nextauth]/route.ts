import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          // Demo authentication logic
          const demoUsers = [
            { id: "1", email: "admin@ghaliah.com", password: "admin123", role: "Admin", name: "Admin User" },
            { id: "2", email: "manager@ghaliah.com", password: "manager123", role: "Manager", name: "Manager User" },
            { id: "3", email: "rep@ghaliah.com", password: "rep123", role: "Rep", name: "Rep User" },
            { id: "4", email: "realshafiqahmed@gmail.com", password: "rep1122", role: "Admin", name: "Nomi Madueke" }
          ]

          const user = demoUsers.find((u) => u.email === credentials.email && u.password === credentials.password)

          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          }

          return null
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      try {
        if (user) {
          // For Google OAuth users, determine role based on email or set default
          if (account?.provider === "google") {
            const email = user.email || ""
            let role = "Rep" // default role

            if (email.includes("admin")) {
              role = "Admin"
            } else if (email.includes("manager")) {
              role = "Manager"
            }

            token.role = role
          } else {
            // For credentials login, role comes from user object
            token.role = (user as any).role || "Rep"
          }
        }
        return token
      } catch (error) {
        console.error("JWT callback error:", error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (session.user && token) {
          ;(session.user as any).role = token.role || "Rep"
        }
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        return session
      }
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
})

export { handler as GET, handler as POST }
