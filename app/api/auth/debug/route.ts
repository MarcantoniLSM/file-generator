import { NextResponse } from "next/server";
import { getCurrentUserProfile } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentUserProfile();

  return NextResponse.json({
    configured: session.configured,
    authenticated: Boolean(session.user),
    user: session.user
      ? {
          id: session.user.id,
          email: session.user.email
        }
      : null,
    profile: session.profile
      ? {
          email: session.profile.email,
          role: session.profile.role,
          access_status: session.profile.access_status
        }
      : null
  });
}
