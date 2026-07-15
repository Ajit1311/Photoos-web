import { LoginBackground } from "@/components/auth/LoginBackground";
import { LoginCard } from "@/components/auth/LoginCard";
import { LoginFooter } from "@/components/auth/LoginFooter";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginLogo } from "@/components/auth/LoginLogo";

import { OAuthButtons } from "@/components/auth/oauth/OAuthButtons";
import { AuthDivider } from "@/components/auth/AuthDivider";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">

      <LoginBackground />

      <div className="relative z-10 w-full max-w-md">

        <LoginCard>

          <div className="space-y-8">

            <LoginLogo />

            <OAuthButtons />

            <AuthDivider />

            <LoginForm />

            <LoginFooter />

          </div>

        </LoginCard>

      </div>

    </main>
  );
}