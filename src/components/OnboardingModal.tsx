"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Rocket, Package, ShoppingCart, Palette, CreditCard, Megaphone, Trophy, ChevronLeft, ChevronRight, Check } from "lucide-react";

interface OnboardingSlide {
  emoji: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  highlight?: string;
  primaryButton: string;
  secondaryButton?: string;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: OnboardingSlide[] = [
    {
      emoji: "🚀",
      title: "هلا بك، تاجر المستقبل!",
      subtitle: "مشروعك الجاهز بين يديك!",
      content: (
        <div className="space-y-4 text-center">
          <p className="text-emerald-400 font-bold text-lg">📦 وش تبي تطلق؟</p>
          <div className="space-y-3 text-zinc-300">
            <p>🛒 متجر رقمي؟</p>
            <p>🎓 أكاديمية؟</p>
            <p>📄 صفحة هبوط تجيب عملاء؟</p>
            <p>👥 موقع عضويات مغلق؟</p>
          </div>
          <p className="text-amber-400 font-bold mt-4">🔥 كلها جاهزة تضبطك من أول ثانية!</p>
        </div>
      ),
      primaryButton: "🚀 يلا نبدأ",
      secondaryButton: "تخطي"
    },
    {
      emoji: "✨",
      title: "متجرك ينطلق في دقيقة",
      content: (
        <div className="space-y-4 text-center">
          <p className="text-zinc-300">🧠 النظام ينسخ لك القالب، يجهز الموقع، يربط الدومين،</p>
          <p className="text-zinc-300">ويرسلك بيانات الدخول</p>
          <p className="text-fuchsia-400 font-bold text-lg mt-6">🚀 خلال أقل من 60 ثانية:</p>
          <div className="space-y-3 text-zinc-200 mt-4">
            <p className="flex items-center justify-center gap-2">
              <span className="text-emerald-500">✅</span> موقعك شغال
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="text-emerald-500">✅</span> دومينك شغال
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="text-emerald-500">✅</span> لوحة التحكم بين يديك
            </p>
          </div>
          <p className="text-amber-400 font-bold mt-6">&ldquo;وش باقي؟ جاهز تبدأ تربح؟&rdquo;</p>
        </div>
      ),
      primaryButton: "👆 كمل معي",
      secondaryButton: "السابق"
    },
    {
      emoji: "💳",
      title: "فعّل اشتراكك الآن",
      content: (
        <div className="space-y-4 text-center">
          <p className="flex items-center justify-center gap-2 text-zinc-200">
            <span className="text-emerald-500">✅</span> اختر خطتك - شهرية أو سنوية
          </p>
          <p className="text-amber-400 font-bold flex items-center justify-center gap-2">
            <span className="text-yellow-500">⚡</span> بعدها على طول... يتم إنشاء مشروعك تلقائياً
          </p>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-4">
            <p className="text-red-400">🚫 ما فيه &ldquo;بنراجع طلبك&rdquo; أو &ldquo;نرجع لك بعد 24 ساعة&rdquo;</p>
          </div>
          <p className="text-emerald-400 font-bold mt-4">✅ تضغط ✅ تدفع ✅ تستلم متجرك الآن</p>
        </div>
      ),
      primaryButton: "وضح لي أكثر",
      secondaryButton: "السابق"
    },
    {
      emoji: "🎨",
      title: "حرّك!",
      subtitle: "بدون مبرمج أو مصمم:",
      content: (
        <div className="space-y-4 text-center">
          <div className="space-y-3 text-zinc-200">
            <p>🎨 غيّر الشعار</p>
            <p>📦 ارفع منتجاتك</p>
            <p>🌈 عدّل الألوان</p>
            <p>💳 اربط بوابة الدفع</p>
          </div>
          <p className="text-amber-400 font-bold mt-6">👑 ملكية كاملة.. أنت المدير الحقيقي</p>
        </div>
      ),
      primaryButton: "وش بعدين؟",
      secondaryButton: "السابق"
    },
    {
      emoji: "📢",
      title: "ابدأ الإعلان",
      content: (
        <div className="space-y-4 text-center">
          <p className="text-zinc-200 flex items-center justify-center gap-2">
            <span>📣</span> بنعطيك خطة إعلانات جاهزة
          </p>
          <div className="space-y-3 text-zinc-300 mt-4">
            <p>📱 اربط TikTok/Snap/Instagram بخطوة</p>
            <p>🎯 حمّل فيديوهاتك</p>
            <p>🔄 ابدأ توصل للعملاء</p>
          </div>
          <p className="text-amber-400 font-bold mt-6">الإعلان يشتغل.. وأول طلبية توصلك بإذن الله</p>
        </div>
      ),
      primaryButton: "🏆 جاهز للنجاح",
      secondaryButton: "السابق"
    },
    {
      emoji: "🏁",
      title: "خلك من النخبة",
      content: (
        <div className="space-y-4 text-center">
          <p className="text-zinc-200 flex items-center justify-center gap-2">
            <span>💰</span> كل يوم نشوف عملاء يربحون
          </p>
          <p className="text-zinc-200 flex items-center justify-center gap-2">
            <span>📈</span> قصص نجاحهم تصير ترند
          </p>
          <p className="text-emerald-400 font-bold mt-4">الآن دورك تكون من ضمنهم</p>
          <p className="text-zinc-300 mt-4">🎉 ارسل لنا أول طلب توصلك.. بنحتفل فيك قدام الجميع</p>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mt-6">
            <p className="text-emerald-400 font-bold">🔐 جاهز تنطلق؟</p>
            <p className="text-zinc-300 mt-2">💙 الحرية تبدأ من هنا.. وبلازر تعطيك المفتاح</p>
          </div>
        </div>
      ),
      primaryButton: "🚀 فعّل اشتراكي الآن!",
      secondaryButton: "السابق"
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg mx-4 bg-gradient-to-b from-[#0d1525] to-[#0a0f1a] rounded-3xl border border-zinc-800/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
        
        <div className="relative p-8 pt-10">
          <div className="text-center mb-6">
            <span className="text-5xl mb-4 block">{slide.emoji}</span>
            <h2 className="text-2xl font-black text-white mb-2">{slide.title}</h2>
            {slide.subtitle && (
              <p className="text-lg font-bold text-blue-400">{slide.subtitle}</p>
            )}
          </div>

          <div className="min-h-[280px] flex items-center justify-center">
            {slide.content}
          </div>

          <div className="flex justify-center gap-2 my-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? "bg-blue-500 w-6" 
                    : "bg-zinc-700 hover:bg-zinc-600"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {slide.secondaryButton && currentSlide > 0 && (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="flex-1 h-14 rounded-xl border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 font-bold text-base"
              >
                {slide.secondaryButton}
              </Button>
            )}
            {slide.secondaryButton && currentSlide === 0 && (
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex-1 h-14 rounded-xl border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 font-bold text-base"
              >
                {slide.secondaryButton}
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-base shadow-lg shadow-blue-500/25"
            >
              {slide.primaryButton}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
