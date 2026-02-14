import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;

      // Always allow auth routes, health, and API info
      if (
        pathname.startsWith("/api/auth") ||
        pathname === "/api/health" ||
        pathname === "/api"
      ) {
        return true;
      }

      // Require login for UI and transcript API
      return !!auth;
    },
  },
});
