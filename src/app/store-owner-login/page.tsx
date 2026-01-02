"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ShieldCheck, TrendingUp, Users, Package, Store } from "lucide-react";

export default function OwnerLoginPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Trust Panel */}
        <div className="hidden md:flex flex-col gap-8 pr-8">
          <div className="space-y-4 text-right">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
              إدارة متجرك الرقمي <br />
              <span className="text-zinc-500">بكل سهولة واحترافية</span>
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              سجل دخولك للوصول إلى لوحة التحكم، إدارة المنتجات، ومتابعة مبيعاتك لحظة بلحظة.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <div className="text-2xl font-bold">+10,000</div>
              <div className="text-sm text-zinc-500">تاجر نشط</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <Package className="w-8 h-8 text-green-600 mb-2" />
              <div className="text-2xl font-bold">+50,000</div>
              <div className="text-sm text-zinc-500">منتج رقمي</div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-none shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="h-2 bg-zinc-900 dark:bg-zinc-50" />
          <CardHeader className="space-y-4 text-center pt-8">
            <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-50 rounded-xl flex items-center justify-center mx-auto">
              <Store className="text-white dark:text-zinc-900 w-7 h-7" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">تسجيل دخول التاجر</CardTitle>
              <CardDescription>
                اختر طريقة تسجيل الدخول المفضلة لديك
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pb-12">
            <SignInButton mode="modal">
              <Button className="w-full h-14 text-lg gap-3 shadow-lg hover:scale-[1.02] transition-all">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    className="text-[#4285F4]"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    className="text-[#34A853]"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    className="text-[#FBBC05]"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    className="text-[#EA4335]"
                  />
                </svg>
                المتابعة باستخدام Google
              </Button>
            </SignInButton>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-100 dark:border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-900 px-4 text-zinc-500">أو عبر البريد الإلكتروني</span>
              </div>
            </div>

            <SignInButton mode="modal">
              <Button variant="outline" className="w-full h-12 text-zinc-600 dark:text-zinc-400">
                تسجيل الدخول بالبريد الإلكتروني
              </Button>
            </SignInButton>

            <div className="text-sm text-center text-zinc-500 mt-8">
              ليس لديك متجر بعد؟{" "}
              <Button variant="link" className="p-0 h-auto font-bold" onClick={() => router.push("/store-registration")}>
                سجل متجرك الآن
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
