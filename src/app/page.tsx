"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { 
  Store, ShoppingBag, ShieldCheck, Zap, Globe, Users, 
  ArrowLeft, ArrowRight, Play, Eye, Check, Star,
  BarChart3, Palette, Search, Rocket, Clock, CreditCard,
  Menu, X
} from "lucide-react";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { type Language, getTranslation } from "@/lib/i18n";

const templateImages = [
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
];

const integrationLogos = [
  { name: "Stripe", icon: "💳" },
  { name: "PayPal", icon: "🅿️" },
  { name: "Google Analytics", icon: "📊" },
  { name: "Mailchimp", icon: "📧" },
  { name: "Zapier", icon: "⚡" },
  { name: "Slack", icon: "💬" },
];

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [lang, setLang] = useState<Language>("ar");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = getTranslation(lang);
  const isRTL = lang === "ar";

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("blzr-lang") as Language;
    if (savedLang && (savedLang === "ar" || savedLang === "en")) {
      setLang(savedLang);
    }
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogin = () => {
    router.push("/store-owner-login");
  };

  const handleStartProject = () => {
    router.push(isSignedIn ? "/dashboard" : "/store-registration");
  };

  const toggleLanguage = () => {
    const newLang = lang === "ar" ? "en" : "ar";
    setLang(newLang);
    localStorage.setItem("blzr-lang", newLang);
  };

  const openPreview = (templateIndex: number) => {
    const previewUrls = [
      "https://demo-ebooks.vercel.app",
      "https://demo-courses.vercel.app",
      "https://demo-designs.vercel.app",
      "https://demo-software.vercel.app",
    ];
    window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: previewUrls[templateIndex] || "#" } }, "*");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden" dir={isRTL ? "rtl" : "ltr"} style={{ direction: isRTL ? "rtl" : "ltr" }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[180px]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl blur-lg opacity-50" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
                <Zap className="text-white w-5 h-5" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
              Blzr
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: t.nav.templates, id: "templates" },
              { label: t.nav.pricing, id: "pricing" },
              { label: t.nav.blog, id: "blog" },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => scrollToSection(item.id)} 
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-sm font-medium transition-all duration-200"
            >
              <Globe className="w-4 h-4 text-violet-400" />
              <span className="hidden sm:inline">{lang === "ar" ? "English" : "عربي"}</span>
              <span className="sm:hidden">{lang === "ar" ? "EN" : "ع"}</span>
            </button>
            
            <SignedOut>
              <Button 
                variant="ghost" 
                onClick={handleLogin} 
                className="hidden sm:flex text-zinc-300 hover:text-white hover:bg-white/5 font-medium"
              >
                {t.nav.login}
              </Button>
            </SignedOut>
            <SignedIn>
              <Button 
                variant="ghost" 
                onClick={() => router.push("/dashboard")} 
                className="hidden sm:flex text-zinc-300 hover:text-white hover:bg-white/5 font-medium"
              >
                {t.nav.dashboard}
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-2xl border-b border-white/[0.06] py-4">
            <div className="flex flex-col px-4 gap-1">
              {[
                { label: t.nav.templates, id: "templates" },
                { label: t.nav.pricing, id: "pricing" },
                { label: t.nav.blog, id: "blog" },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => scrollToSection(item.id)} 
                  className="px-4 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-start"
                >
                  {item.label}
                </button>
              ))}
              <SignedOut>
                <button 
                  onClick={handleLogin}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-start"
                >
                  {t.nav.login}
                </button>
              </SignedOut>
            </div>
          </div>
        )}
      </header>

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]" />
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            {t.hero.badge}
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
              {t.hero.title}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            {t.hero.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleStartProject}
              className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 border-0 gap-2"
            >
              {t.hero.cta}
              {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => scrollToSection("templates")}
              className="h-14 px-8 text-lg font-bold border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2"
            >
              <Eye className="w-5 h-5" />
              {t.hero.viewTemplates}
            </Button>
          </div>

          <div className="mt-16 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-3xl blur-2xl" />
            <div className="relative bg-[#12122a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="h-10 bg-[#0a0a1a] border-b border-white/5 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-white/5 rounded-md text-xs text-zinc-500 font-mono">
                    blzr.net
                  </div>
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-[#12122a] to-[#1a1a3a] p-8">
                <div className="h-full border border-white/5 rounded-xl bg-white/[0.02] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center">
                      <Store className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-zinc-500 text-sm">{isRTL ? "معاينة المتجر" : "Store Preview"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium mb-4">
              <Star className="w-4 h-4 fill-amber-400" />
              {t.why.title}
            </div>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">{t.why.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.why.features.map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4 group-hover:from-violet-500/30 group-hover:to-fuchsia-500/30 transition-colors">
                  {i === 0 && <ShieldCheck className="w-6 h-6 text-violet-400" />}
                  {i === 1 && <Clock className="w-6 h-6 text-violet-400" />}
                  {i === 2 && <ShieldCheck className="w-6 h-6 text-violet-400" />}
                  {i === 3 && <CreditCard className="w-6 h-6 text-violet-400" />}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-zinc-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="py-24 bg-gradient-to-b from-transparent via-violet-900/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium mb-4">
              <Palette className="w-4 h-4" />
              {t.templates.title}
            </div>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">{t.templates.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.templates.items.map((template, i) => (
              <div key={i} className="group rounded-2xl bg-[#12122a] border border-white/5 overflow-hidden hover:border-violet-500/30 transition-all">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img 
                    src={templateImages[i]} 
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12122a] via-transparent to-transparent opacity-60" />
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded-md bg-violet-500/80 text-xs font-medium">
                      {template.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-3">{template.name}</h3>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => openPreview(i)}
                      className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {t.templates.preview}
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleStartProject}
                      className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs"
                    >
                      {t.templates.useTemplate}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t.steps.title}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.steps.items.map((step, i) => (
              <div key={i} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-2xl font-black">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-zinc-500">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-violet-500/50 to-transparent -translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-transparent via-fuchsia-900/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t.features.title}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.features.items.map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-fuchsia-500/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 flex items-center justify-center mb-4">
                  {i === 0 && <BarChart3 className="w-6 h-6 text-fuchsia-400" />}
                  {i === 1 && <Palette className="w-6 h-6 text-fuchsia-400" />}
                  {i === 2 && <Search className="w-6 h-6 text-fuchsia-400" />}
                  {i === 3 && <Rocket className="w-6 h-6 text-fuchsia-400" />}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-zinc-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t.integrations.title}</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">{t.integrations.subtitle}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {integrationLogos.map((logo, i) => (
              <div key={i} className="w-32 h-20 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center gap-2 hover:border-violet-500/30 transition-all">
                <span className="text-2xl">{logo.icon}</span>
                <span className="text-sm font-medium text-zinc-400">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="blog" className="py-24 bg-gradient-to-b from-transparent via-violet-900/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t.testimonials.title}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.testimonials.items.map((testimonial, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#12122a] border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-lg font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-zinc-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-zinc-400">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {t.stats.merchants}
              </div>
              <div className="text-zinc-500 mt-2">{t.stats.merchantsLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {t.stats.revenue}
              </div>
              <div className="text-zinc-500 mt-2">{t.stats.revenueLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {t.stats.uptime}
              </div>
              <div className="text-zinc-500 mt-2">{t.stats.uptimeLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                {t.stats.support}
              </div>
              <div className="text-zinc-500 mt-2">{t.stats.supportLabel}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtMmg0djJoMnY0aC0ydjJoLTR2LTJ6bTAtMTBoLTJ2LTRoMnYtMmg0djJoMnY0aC0ydjJoLTR2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-black mb-4">{t.cta.title}</h2>
              <p className="text-white/80 text-lg mb-8">{t.cta.subtitle}</p>
              <Button 
                size="lg"
                onClick={handleStartProject}
                className="h-14 px-10 text-lg font-bold bg-white text-violet-600 hover:bg-white/90 gap-2"
              >
                {t.cta.button}
                {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                <Zap className="text-white w-4 h-4" />
              </div>
              <span className="font-bold">Blzr</span>
            </div>
            <div className="flex gap-6 text-sm text-zinc-500">
              <a href="#" className="hover:text-white transition-colors">{t.footer.privacy}</a>
              <a href="#" className="hover:text-white transition-colors">{t.footer.terms}</a>
              <a href="#" className="hover:text-white transition-colors">{t.footer.contact}</a>
            </div>
            <div className="text-sm text-zinc-600">{t.footer.rights}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
