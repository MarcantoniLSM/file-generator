import AuthForm from "@/components/AuthForm";
import { getCurrentUserProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const session = await getCurrentUserProfile();

  if (session.user && session.profile?.access_status !== "blocked") {
    redirect(session.profile?.role === "admin" ? "/admin" : "/gerador");
  }

  const { erro } = await searchParams;

  return <AuthForm mode="login" error={erro} />;
}
