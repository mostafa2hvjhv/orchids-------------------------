"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { stripePromise } from "@/lib/stripe-client";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, ChevronLeft, Upload, Globe, CreditCard, Store, User, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useSignUp, useSignIn } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'حدث خطأ');
      setProcessing(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'فشل في معالجة الدفع');
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    } else {
      setError('الدفع قيد المعالجة، يرجى الانتظار');
    }
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}
      <Button 
        type="submit" 
        className="w-full h-12 text-lg gap-2 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 hover:scale-[1.02] active:scale-[0.98] transition-all" 
        disabled={!stripe || !elements || processing}
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> جاري المعالجة...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" /> إتمام الدفع وإنشاء المتجر
          </>
        )}
      </Button>
    </form>
  );
}

export default function StoreRegistrationPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [tempStoreId, setTempStoreId] = useState<string | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    storeName: "",
    storeDescription: "",
    storeType: "",
    storeSlug: "",
    logoUrl: "",
    plan: "free",
  });
  
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const router = useRouter();

    const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
    const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
    const { signIn, isLoaded: isSignInLoaded } = useSignIn();

    const slugify = (text: string) => {
    let slug = text.toLowerCase();
    const translit: { [key: string]: string } = {
      'أ': 'a', 'إ': 'i', 'آ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
      'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't',
      'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
      'ه': 'h', 'و': 'w', 'ي': 'y', 'ة': 'h', 'ى': 'a'
    };
    slug = slug.split('').map(char => translit[char] || char).join('');
    return slug
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug) return;
    setSlugChecking(true);
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("slug")
        .eq("slug", slug)
        .maybeSingle();
      
      if (error) throw error;
      setSlugAvailable(!data);
    } catch (error) {
      console.error("Error checking slug:", error);
    } finally {
      setSlugChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!slugManuallyEdited && formData.storeName && step === 2) {
      const generatedSlug = slugify(formData.storeName);
      if (generatedSlug && generatedSlug !== formData.storeSlug) {
        setFormData(prev => ({ ...prev, storeSlug: generatedSlug }));
        setSlugAvailable(null);
      }
    }
  }, [formData.storeName, slugManuallyEdited, step]); // Removed formData.storeSlug to avoid potential loops

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.storeSlug && slugAvailable === null) {
        checkSlugAvailability(formData.storeSlug);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.storeSlug, slugAvailable, checkSlugAvailability]);

  const handleGoogleLogin = async () => {
    if (!isSignUpLoaded || !isSignInLoaded) return;
    try {
      const si = await signIn.create({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        actionCompleteRedirectUrl: "/store-registration",
      });

      const redirectUrl = (si as any).firstFactorVerification?.externalVerificationRedirectURL || 
                          (si as any).firstFactorVerification?.externalVerificationRedirectUrl;

      if (redirectUrl) {
        window.parent.postMessage({ 
          type: "OPEN_EXTERNAL_URL", 
          data: { url: redirectUrl.toString() } 
        }, "*");
      } else {
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/store-registration",
        });
      }
    } catch (error: any) {
      toast.error("خطأ في تسجيل الدخول: " + error.message);
    }
  };

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    if (data.storeSlug !== undefined) {
      setSlugAvailable(null);
    }
  };

  const nextStep = () => {
    if (step === 2) {
      if (!formData.storeName || !formData.storeType || !formData.storeSlug) {
        toast.error("يرجى ملء جميع الحقول المطلوبة واختيار رابط للمتجر");
        return;
      }
      if (slugAvailable === false) {
        toast.error("رابط المتجر غير متاح، يرجى اختيار رابط آخر");
        return;
      }
    }
    setStep(s => s + 1);
  };
  
  const prevStep = () => setStep(s => s - 1);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `store-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      updateFormData({ logoUrl: publicUrl });
      toast.success("تم رفع الشعار بنجاح");
    } catch (error: any) {
      toast.error("فشل رفع الشعار: " + error.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    if (isUserLoaded && isSignedIn && user) {
      updateFormData({ email: user.primaryEmailAddress?.emailAddress || "" });
      if (step === 1) {
        setStep(2);
      }
    }
  }, [isUserLoaded, isSignedIn, user]);

  const handleRegister = async () => {
    if (!isSignedIn || !user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      console.log("Registering store for user:", user.id);

      // 1. Create/Update Profile (id is text, matches user.id)
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: formData.fullName || user.fullName || "تاجر جديد",
        phone: formData.phone,
        role: "owner",
      });

      if (profileError) {
        console.error("Profile Error Detail:", profileError);
        throw new Error(`خطأ في تحديث الملف الشخصي: ${profileError.message} (${profileError.code})`);
      }

      // 2. Create Store (owner_id is text)
      const { data: storeData, error: storeError } = await supabase.from("stores").insert({
        owner_id: user.id,
        name: formData.storeName,
        slug: formData.storeSlug,
        description: formData.storeDescription,
        logo_url: formData.logoUrl,
        store_type: formData.storeType,
        subscription_plan: formData.plan,
        plan: formData.plan, // Explicitly set plan as well
        status: "active",
        branding: {}
      }).select().single();

      if (storeError) {
        console.error("Store Error:", storeError);
        throw new Error(`خطأ في إنشاء المتجر: ${storeError.message}`);
      }

      if (formData.plan === "free") {
        toast.success("تم إنشاء متجرك بنجاح!");
        router.push("/dashboard");
      } else {
        const response = await fetch('/api/subscription/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId: storeData.id,
            email: user.primaryEmailAddress?.emailAddress,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        setClientSecret(data.clientSecret);
        setTempStoreId(storeData.id);
        setStep(4); // Payment step is now 4 if steps are consolidated
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إنشاء المتجر");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (tempStoreId) {
      await supabase.from('stores').update({ subscription_plan: 'pro' }).eq('id', tempStoreId);
      await supabase.from('subscriptions').update({ status: 'active' }).eq('store_id', tempStoreId);
    }
    toast.success("تم تفعيل الخطة الاحترافية بنجاح!");
    router.push("/dashboard");
  };

  if (!isUserLoaded) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <Loader2 className="w-10 h-10 animate-spin text-zinc-900 dark:text-zinc-50" />
    </div>
  );

  const steps = [
    { id: 1, name: "البداية", icon: User },
    { id: 2, name: "المتجر", icon: Store },
    { id: 3, name: "الخطة", icon: CreditCard },
    ...(formData.plan === "pro" ? [{ id: 4, name: "الدفع", icon: CreditCard }] : [])
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 font-cairo">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between relative px-4">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex flex-col items-center z-10">
                <motion.div 
                  initial={false}
                  animate={{
                    backgroundColor: step >= s.id ? "var(--zinc-900)" : "var(--white)",
                    borderColor: step >= s.id ? "var(--zinc-900)" : "var(--zinc-200)",
                    color: step >= s.id ? "white" : "var(--zinc-400)",
                    scale: step === s.id ? 1.1 : 1,
                  }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-sm`}
                >
                  {step > s.id ? <Check className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                </motion.div>
                <span className={`text-xs mt-3 font-black tracking-tight ${step >= s.id ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400"}`}>
                  {s.name}
                </span>
              </div>
            ))}
            <div className="absolute top-6 left-12 right-12 h-[2px] bg-zinc-200 dark:bg-zinc-800 -z-0">
              <motion.div 
                className="h-full bg-zinc-900 dark:bg-zinc-50 shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                initial={{ width: "0%" }}
                animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "circOut" }}
          >
            <Card className="shadow-2xl border-none ring-1 ring-zinc-200 dark:ring-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-[2rem] overflow-hidden">
              <CardHeader className="pb-8 pt-10 px-10">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center shadow-xl ring-4 ring-zinc-100 dark:ring-zinc-800">
                    {step === 1 && <User className="text-white dark:text-zinc-900 w-7 h-7" />}
                    {step === 2 && <Store className="text-white dark:text-zinc-900 w-7 h-7" />}
                    {step === 3 && <Sparkles className="text-white dark:text-zinc-900 w-7 h-7" />}
                    {step === 4 && <CreditCard className="text-white dark:text-zinc-900 w-7 h-7" />}
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-black tracking-tight">
                      {step === 1 && "ابدأ رحلتك"}
                      {step === 2 && "هوية متجرك"}
                      {step === 3 && "اختر قوتك"}
                      {step === 4 && "تأكيد الاشتراك"}
                    </CardTitle>
                    <CardDescription className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                      {step === 1 && "سجل دخولك لبناء إمبراطوريتك الرقمية"}
                      {step === 2 && "الأساس الذي سيقوم عليه نجاحك"}
                      {step === 3 && "باقات مصممة لنمو أعمالك"}
                      {step === 4 && "خطوة واحدة تفصلك عن الانطلاق"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-10 pb-10 space-y-8">
                {step === 1 && (
                  <div className="space-y-10 flex flex-col items-center py-6">
                    <Button 
                      onClick={handleGoogleLogin}
                      className="w-full h-16 text-xl gap-4 bg-white hover:bg-zinc-50 text-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all rounded-[1.25rem]"
                    >
                      <svg className="w-7 h-7" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      المتابعة باستخدام Google
                    </Button>
                    <div className="flex items-center gap-6 w-full">
                      <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 flex-1" />
                      <span className="text-sm text-zinc-400 font-black uppercase tracking-[0.2em]">أو</span>
                      <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 flex-1" />
                    </div>
                    <div className="text-lg text-zinc-500 font-bold">
                      لديك حساب بالفعل؟ <Button variant="link" className="p-0 h-auto font-black text-zinc-900 dark:text-zinc-50 text-lg underline underline-offset-8" onClick={() => router.push('/store-owner-login')}>سجل دخولك هنا</Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-base font-black tracking-tight">اسم المتجر</Label>
                        <Input 
                          placeholder="مثلاً: متجر النخبة للبرمجة" 
                          value={formData.storeName} 
                          className="h-14 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800/50 transition-all"
                          onChange={e => updateFormData({ storeName: e.target.value })} 
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-base font-black tracking-tight">تصنيف المنتجات</Label>
                        <Select onValueChange={val => updateFormData({ storeType: val })} value={formData.storeType}>
                          <SelectTrigger className="h-14 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-2xl text-lg font-bold">
                            <SelectValue placeholder="ماذا ستبيع؟" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            <SelectItem value="books" className="h-12 text-base font-bold">كتب إلكترونية</SelectItem>
                            <SelectItem value="courses" className="h-12 text-base font-bold">دورات تدريبية</SelectItem>
                            <SelectItem value="software" className="h-12 text-base font-bold">برمجيات وأكواد</SelectItem>
                            <SelectItem value="design" className="h-12 text-base font-bold">تصاميم وقوالب</SelectItem>
                            <SelectItem value="gaming" className="h-12 text-base font-bold">ألعاب وخدمات</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-black tracking-tight flex items-center justify-between">
                        رابط المتجر الذكي
                        {slugChecking && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
                      </Label>
                      <div className="relative group">
                        <div className="flex items-center gap-0 dir-ltr">
                          <span className="bg-zinc-100 dark:bg-zinc-800 px-6 h-14 flex items-center rounded-l-2xl border-y border-l border-zinc-200 dark:border-zinc-800 text-zinc-400 font-black text-lg">.mystore.com</span>
                          <Input 
                            placeholder="my-store" 
                            value={formData.storeSlug}
                            onChange={e => {
                              setSlugManuallyEdited(true);
                              updateFormData({ storeSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') });
                            }}
                            className="h-14 text-xl font-black border-zinc-200 dark:border-zinc-800 rounded-none rounded-r-2xl border-l-0 focus-visible:ring-0 bg-zinc-50/50 dark:bg-zinc-900/50 pr-12"
                          />
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {slugAvailable === true && <Check className="w-6 h-6 text-green-500 bg-green-50 dark:bg-green-900/20 rounded-full p-1" />}
                          {slugAvailable === false && <AlertCircle className="w-6 h-6 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-full p-1" />}
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400 font-bold px-2">
                        {slugAvailable === false ? "هذا الرابط مستخدم بالفعل" : "سيتم توليد الرابط تلقائياً، ويمكنك تعديله يدوياً"}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-black tracking-tight">عن متجرك</Label>
                      <textarea 
                        className="w-full min-h-[140px] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-lg font-medium focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800/50 transition-all outline-none resize-none shadow-inner"
                        placeholder="اكتب وصفاً ملهماً يشجع العملاء على الشراء من متجرك..."
                        value={formData.storeDescription}
                        onChange={e => updateFormData({ storeDescription: e.target.value })}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-black tracking-tight">شعار المتجر الاحترافي</Label>
                      <label className="border-4 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[2rem] p-10 text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all block group relative overflow-hidden bg-white/50 dark:bg-black/20">
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
                        {uploadingLogo ? (
                          <div className="space-y-4">
                            <Loader2 className="w-12 h-12 mx-auto text-zinc-900 dark:text-zinc-50 animate-spin" />
                            <p className="text-lg font-black">جاري رفع علامتك التجارية...</p>
                          </div>
                        ) : formData.logoUrl ? (
                          <div className="relative group inline-block">
                            <img src={formData.logoUrl} className="w-32 h-32 mx-auto object-contain rounded-2xl shadow-2xl" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                              <Upload className="text-white w-8 h-8" />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-md">
                              <Upload className="w-8 h-8 text-zinc-400" />
                            </div>
                            <div>
                              <p className="text-lg font-black">انقر لإضافة شعارك</p>
                              <p className="text-sm text-zinc-500 font-bold mt-1">يُفضل خلفية شفافة لنتائج أفضل</p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div 
                      whileHover={{ y: -10 }}
                      className={`p-8 rounded-[2rem] border-4 cursor-pointer transition-all relative overflow-hidden ${
                        formData.plan === "free" ? "border-zinc-900 dark:border-zinc-50 bg-zinc-50/50 dark:bg-zinc-900/50 shadow-2xl" : "border-zinc-100 dark:border-zinc-800"
                      }`}
                      onClick={() => updateFormData({ plan: "free" })}
                    >
                      <div className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">للبدايات الواعدة</div>
                      <div className="text-3xl font-black mb-2">الباقة المجانية</div>
                      <div className="text-4xl font-black mb-8">0 <span className="text-lg font-bold text-zinc-500">ريال / شهر</span></div>
                      <ul className="space-y-5 text-base font-bold">
                        <li className="flex items-center gap-4"><div className="w-6 h-6 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-green-600" /></div> حتى 10 منتجات</li>
                        <li className="flex items-center gap-4"><div className="w-6 h-6 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-green-600" /></div> عمولة 5% على المبيعات</li>
                        <li className="flex items-center gap-4"><div className="w-6 h-6 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-green-600" /></div> متجر أساسي متكامل</li>
                      </ul>
                      {formData.plan === "free" && <div className="absolute top-6 left-6 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 p-1.5 rounded-full"><Check className="w-5 h-5" /></div>}
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -10 }}
                      className={`p-8 rounded-[2rem] border-4 cursor-pointer transition-all relative overflow-hidden ${
                        formData.plan === "pro" ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-2xl" : "border-zinc-100 dark:border-zinc-800"
                      }`}
                      onClick={() => updateFormData({ plan: "pro" })}
                    >
                      <div className="absolute -right-14 top-8 bg-blue-600 text-white text-[10px] px-14 py-2 rotate-45 font-black uppercase tracking-widest shadow-lg">الأكثر نمواً</div>
                      <div className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-4">للمحترفين</div>
                      <div className="text-3xl font-black mb-2">الباقة الاحترافية</div>
                      <div className="text-4xl font-black mb-8">99 <span className="text-lg font-bold text-zinc-500">ريال / شهر</span></div>
                      <ul className="space-y-5 text-base font-bold">
                        <li className="flex items-center gap-4"><div className="w-6 h-6 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-blue-600" /></div> منتجات غير محدودة</li>
                        <li className="flex items-center gap-4"><div className="w-6 h-6 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-blue-600" /></div> عمولة 0% (أرباحك لك)</li>
                        <li className="flex items-center gap-4"><div className="w-6 h-6 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-blue-600" /></div> نطاق مخصص (yourname.com)</li>
                        <li className="flex items-center gap-4"><div className="w-6 h-6 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-blue-600" /></div> دعم فني VIP سريع</li>
                      </ul>
                      {formData.plan === "pro" && <div className="absolute top-6 left-6 bg-blue-600 text-white p-1.5 rounded-full shadow-lg"><Check className="w-5 h-5" /></div>}
                    </motion.div>
                  </div>
                )}

                {step === 4 && clientSecret && (
                  <div className="max-w-md mx-auto py-4">
                    <Elements 
                      stripe={stripePromise} 
                      options={{ 
                        clientSecret,
                        appearance: {
                          theme: 'night',
                          variables: {
                            colorPrimary: '#18181b',
                            fontFamily: 'Cairo, sans-serif',
                            borderRadius: '16px',
                          },
                        },
                        locale: 'ar',
                      }}
                    >
                      <PaymentForm onSuccess={handlePaymentSuccess} />
                    </Elements>
                  </div>
                )}
              </CardContent>

              {step < 4 && (
                <CardFooter className="flex justify-between p-10 bg-zinc-50/50 dark:bg-black/20 border-t border-zinc-100 dark:border-zinc-800">
                  {step > 1 ? (
                    <Button variant="ghost" onClick={prevStep} className="flex items-center gap-3 font-black text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 h-16 px-8 rounded-2xl transition-all">
                      <ChevronRight className="w-5 h-5" /> السابق
                    </Button>
                  ) : (
                    <div />
                  )}
                  
                  {step < 3 ? (
                    <Button 
                      onClick={nextStep} 
                      className="flex items-center gap-3 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 font-black text-lg h-16 px-10 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                      التالي <ChevronLeft className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleRegister} 
                      className="flex items-center gap-3 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 font-black text-lg h-16 px-10 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> جاري التأسيس...
                        </>
                      ) : formData.plan === "pro" ? (
                        <>
                          تأكيد واشتراك <ChevronLeft className="w-5 h-5" />
                        </>
                      ) : (
                        <>
                          إطلاق المتجر الآن <Check className="w-6 h-6" />
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 text-center text-zinc-400 text-sm font-black uppercase tracking-[0.4em] opacity-50">
          تكنولوجيا النخبة الرقمية &copy; 2025
        </div>
      </div>
    </div>
  );
}
