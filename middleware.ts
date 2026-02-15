export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/", "/api/transcript/:path*", "/api/summaries/:path*"],
};
