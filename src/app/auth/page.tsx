import { LoginForm } from "@/components/sections/LoginForm";
import { AuthHero } from "@/components/sections/AuthHero";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-white-50 to-green-50 px-6">
      <div className="w-full max-w-5xl h-130 lg:h-140 flex rounded-xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.12)] bg-white">
        {/* Hero */}
        <AuthHero />

        {/* Login */}
        <div className="flex flex-1 items-center justify-center p-10">
          <div className="w-full max-w-sm">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
