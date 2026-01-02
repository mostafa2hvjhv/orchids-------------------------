"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Plus, 
  TrendingUp, 
  Download,
  Search,
  ChevronLeft,
  Menu,
  Globe,
  Palette,
  CheckSquare,
  CreditCard,
  Hash,
  HelpCircle,
  ExternalLink,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUser, useClerk } from "@clerk/nextjs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import OnboardingModal from "@/components/OnboardingModal";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Force RTL for this page
    document.documentElement.dir = "rtl";
    return () => {
      document.documentElement.dir = "ltr";
    };
  }, []);

useEffect(() => {
      if (isLoaded && !isSignedIn) {
        router.push("/store-owner-login");
        return;
      }

      async function fetchStore() {
        if (user) {
          const { data: storeData } = await supabase
            .from("stores")
            .select("*")
            .eq("owner_id", user.id)
            .single();
          
          setStore(storeData);
          setLoading(false);

          const hasSeenOnboarding = localStorage.getItem("blzr-onboarding-complete");
          if (!hasSeenOnboarding) {
            setShowOnboarding(true);
          }
        }
      }

      if (isLoaded && isSignedIn) {
        fetchStore();
      }
    }, [isLoaded, isSignedIn, user, router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    localStorage.setItem("blzr-onboarding-complete", "true");
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("blzr-onboarding-complete", "true");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0a0a0b] text-zinc-400">
      <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Package className="text-white w-6 h-6" />
          </div>
          <div>
            <span className="font-black text-white block text-lg tracking-tight">{store?.name || "Blazr"}</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">لوحة التحكم</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
        <section>
          <div className="px-4 mb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">القائمة الرئيسية</div>
          <div className="space-y-1">
            <NavItem icon={<LayoutDashboard className="w-4 h-4" />} label="لوحة التحكم" active />
            <NavItem icon={<Globe className="w-4 h-4" />} label="المواقع" />
            <NavItem icon={<Palette className="w-4 h-4" />} label="القوالب" />
            <NavItem icon={<CheckSquare className="w-4 h-4" />} label="المهام" badge="جديد" />
          </div>
        </section>

        <section>
          <div className="px-4 mb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">الأعمال</div>
          <div className="space-y-1">
            <NavItem icon={<Hash className="w-4 h-4" />} label="ربط النطاق" />
            <NavItem icon={<CreditCard className="w-4 h-4" />} label="بوابات الدفع" />
            <NavItem icon={<Users className="w-4 h-4" />} label="الاشتراكات الرقمية جملة" />
            <NavItem icon={<ShoppingCart className="w-4 h-4" />} label="المنتجات المربحة" />
            <NavItem icon={<Search className="w-4 h-4" />} label="بحث المنتجات" />
            <NavItem icon={<Download className="w-4 h-4" />} label="إستيراد من علي إكسبريس" />
          </div>
        </section>

        <section>
          <div className="px-4 mb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">التعلم</div>
          <div className="space-y-1">
            <NavItem icon={<Package className="w-4 h-4" />} label="BlazrAcademy" />
            <NavItem icon={<HelpCircle className="w-4 h-4" />} label="مركز المساعدة" />
          </div>
        </section>

        <section>
          <div className="px-4 mb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">الإعدادات</div>
          <div className="space-y-1">
            <NavItem icon={<Settings className="w-4 h-4" />} label="الإعدادات" />
            <NavItem icon={<CreditCard className="w-4 h-4" />} label="الاشتراك" />
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-zinc-800/50 bg-[#0c0c0d]">
        <div className="mb-4 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 font-bold text-xs">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{user?.email?.split('@')[0]}</div>
              <div className="text-[10px] text-zinc-500 truncate">{user?.email}</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-500">الخطة الحالية: <span className="text-blue-500 font-bold">مجاني</span></span>
            <button className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
              ترقية <ExternalLink className="w-2 h-2" />
            </button>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl h-11 transition-all duration-200" 
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" /> 
          <span className="font-bold text-sm">تسجيل الخروج</span>
        </Button>
      </div>
    </div>
  );

return (
      <div className="min-h-screen bg-[#060607] text-white flex overflow-hidden">
        <OnboardingModal 
          isOpen={showOnboarding} 
          onClose={handleOnboardingClose}
          onComplete={handleOnboardingComplete}
        />
        {/* Sidebar - Desktop */}
      <aside className="w-72 border-l border-zinc-800/50 hidden lg:block overflow-hidden h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Header */}
        <header className="h-20 border-b border-zinc-800/50 bg-[#0a0a0b]/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-zinc-400 hover:text-white">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 border-l-zinc-800 w-72">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            
            <div className="relative hidden md:block w-72 lg:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input 
                placeholder="ابحث عن أي شيء..." 
                className="pr-10 bg-zinc-900/50 border-zinc-800/50 focus:border-blue-500/50 transition-all rounded-xl h-11 text-sm" 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-6">
            <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0a0a0b]" />
            </Button>
            
            <div className="h-8 w-[1px] bg-zinc-800 mx-1 hidden sm:block" />
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-left md:text-right">
                <div className="text-xs font-black text-white">{user?.email?.split('@')[0]}</div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">تاجر بلوزر</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-[2px] shadow-lg shadow-blue-500/20">
                <div className="w-full h-full rounded-[10px] bg-[#0a0a0b] flex items-center justify-center font-black text-blue-500">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 lg:p-10 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-blue-500 mb-2">
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">لوحة التحكم العامة</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white">مرحباً بك مجدداً، {user?.email?.split('@')[0]} <span className="animate-pulse">👋</span></h2>
              <p className="text-zinc-500 mt-2 text-sm lg:text-base">إليك ملخص سريع لأداء متجرك الرقمي اليوم.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-zinc-800 hover:bg-zinc-900 rounded-xl h-12 px-6 font-bold text-zinc-300">
                تحميل التقرير
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-12 px-6 font-bold gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                <Plus className="w-5 h-5" /> إضافة منتج
              </Button>
            </div>
          </div>

          {/* Settings Section with Logout as requested */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold">الأمان والحساب</h3>
                <p className="text-zinc-500 text-sm">إدارة إعدادات الأمان والوصول للحساب</p>
              </div>
            </div>

            <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-zinc-800/50">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">البريد الإلكتروني</label>
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-400 font-medium">
                      {user?.email}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">اللغة</label>
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 font-bold flex items-center justify-between">
                      العربية
                      <Globe className="w-4 h-4 text-zinc-600" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                      <LogOut className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">إنهاء الجلسة</h4>
                      <p className="text-zinc-500 text-sm">سيتم تسجيل خروجك من جميع الأجهزة المتصلة</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleLogout}
                    className="w-full md:w-auto bg-red-600 hover:bg-red-500 text-white font-black px-12 h-14 rounded-2xl shadow-xl shadow-red-900/20 transition-all active:scale-95 flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5" /> تسجيل الخروج الآن
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              title="إجمالي الأرباح" 
              value="45,280 ريال" 
              trend="+12.5%" 
              trendUp={true}
              icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
            />
            <MetricCard 
              title="إجمالي الطلبات" 
              value="1,247" 
              trend="+5.2%" 
              trendUp={true}
              icon={<ShoppingCart className="w-6 h-6 text-green-600" />}
            />
            <MetricCard 
              title="التحميلات" 
              value="3,892" 
              trend="+8.1%" 
              trendUp={true}
              icon={<Download className="w-6 h-6 text-purple-600" />}
            />
            <MetricCard 
              title="العملاء الجدد" 
              value="892" 
              trend="-2.4%" 
              trendUp={false}
              icon={<Users className="w-6 h-6 text-amber-600" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue Chart Placeholder */}
            <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-50 dark:border-zinc-800">
                <CardTitle className="text-lg">إحصائيات المبيعات</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-xs h-8">أسبوع</Button>
                  <Button variant="ghost" size="sm" className="text-xs h-8 bg-zinc-100 dark:bg-zinc-800">شهر</Button>
                  <Button variant="ghost" size="sm" className="text-xs h-8">سنة</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[350px] flex flex-col items-center justify-center text-zinc-400 bg-gradient-to-b from-transparent to-zinc-50/50 dark:to-zinc-900/20">
                  <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
                  <p>الرسم البياني سيظهر هنا عند توفر البيانات</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Store Health */}
            <div className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">صحة المتجر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">مكتمل بنسبة 85%</span>
                      <span className="text-green-600">ممتاز</span>
                    </div>
                    <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full w-[85%]" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <HealthItem label="تفعيل بوابة الدفع" completed={true} />
                    <HealthItem label="رفع أول 5 منتجات" completed={true} />
                    <HealthItem label="تخصيص هوية المتجر" completed={true} />
                    <HealthItem label="ربط نطاق مخصص" completed={false} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2">هل تحتاج للمساعدة؟</h3>
                  <p className="text-zinc-400 dark:text-zinc-600 text-sm mb-4">مدير حسابك الشخصي جاهز لمساعدتك في أي وقت.</p>
                  <Button className="w-full bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white">تواصل معنا</Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Orders */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-50 dark:border-zinc-800">
              <CardTitle className="text-lg">أحدث الطلبات</CardTitle>
              <Button variant="link" className="text-xs h-8">عرض الكل</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs text-zinc-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">العميل</th>
                      <th className="px-6 py-4">المنتج</th>
                      <th className="px-6 py-4">السعر</th>
                      <th className="px-6 py-4">الحالة</th>
                      <th className="px-6 py-4 text-left">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                    <OrderRow name="أحمد محمود" email="ahmed@example.com" product="كتاب التسويق الرقمي" price="150 ر.س" status="مكتمل" date="منذ ساعتين" />
                    <OrderRow name="سارة خالد" email="sara@example.com" product="دورة تصميم الواجهات" price="450 ر.س" status="قيد المعالجة" date="منذ 5 ساعات" />
                    <OrderRow name="محمد عادل" email="mo@example.com" product="قالب متجر إلكتروني" price="299 ر.س" status="مكتمل" date="أمس، 10:30 م" />
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick, badge }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, badge?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
          : "text-zinc-500 hover:bg-zinc-900 hover:text-white"
      }`}
    >
      <span className={`${active ? "text-white" : "text-zinc-500 group-hover:text-blue-500"} transition-colors`}>
        {icon}
      </span>
      <span className="flex-1 text-right">{label}</span>
      {badge && (
        <span className="text-[8px] bg-blue-600/10 text-blue-500 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter">
          {badge}
        </span>
      )}
      {active && <ChevronLeft className="w-4 h-4 mr-auto opacity-50" />}
    </button>
  );
}

function MetricCard({ title, value, trend, trendUp, icon }: { title: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode }) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 group-hover:border-blue-500/50 transition-colors">
            {icon}
          </div>
          <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${
            trendUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          }`}>
            {trend}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-black text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthItem({ label, completed }: { label: string, completed: boolean }) {
  return (
    <div className="flex items-center gap-3 text-sm group">
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
        completed 
          ? "bg-green-500/10 border-green-500/50 text-green-500" 
          : "border-zinc-800 bg-zinc-950 text-zinc-600"
      }`}>
        {completed ? <Plus className="w-3 h-3 rotate-45" /> : <div className="w-1 h-1 bg-current rounded-full" />}
      </div>
      <span className={completed ? "text-zinc-200 font-bold" : "text-zinc-500"}>{label}</span>
    </div>
  );
}

function OrderRow({ name, email, product, price, status, date }: { name: string, email: string, product: string, price: string, status: string, date: string }) {
  return (
    <tr className="hover:bg-zinc-900/50 transition-all duration-200 group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 font-bold">
            {name.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-bold text-white group-hover:text-blue-500 transition-colors">{name}</div>
            <div className="text-[10px] text-zinc-500">{email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-bold text-zinc-300">{product}</td>
      <td className="px-6 py-4 text-sm font-black text-blue-500">{price}</td>
      <td className="px-6 py-4">
        <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${
          status === "مكتمل" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
        }`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-xs text-zinc-500 text-left font-medium">{date}</td>
    </tr>
  );
}
