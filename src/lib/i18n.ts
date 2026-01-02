export type Language = "ar" | "en";

export const translations = {
  ar: {
    nav: {
      templates: "القوالب",
      pricing: "الأسعار",
      blog: "المدونة",
      login: "تسجيل الدخول",
      dashboard: "لوحة التحكم",
    },
    hero: {
      badge: "منصة إنشاء المتاجر الرقمية",
      title: "أطلق مشروعك الرقمي في دقائق",
      subtitle: "منصة متكاملة لإنشاء متجرك الإلكتروني لبيع المنتجات الرقمية - كتب، دورات، قوالب، برمجيات",
      cta: "ابدأ مشروعك",
      viewTemplates: "شاهد القوالب",
    },
    why: {
      title: "لماذا Blzr؟",
      subtitle: "كل ما تحتاجه لإطلاق متجرك الرقمي في مكان واحد",
      features: [
        { title: "بدون رسوم مخفية", desc: "لا عمولات على مبيعاتك" },
        { title: "دعم تقني متواصل", desc: "فريق دعم متاح على مدار الساعة" },
        { title: "حماية الملفات", desc: "روابط تحميل آمنة ومؤقتة" },
        { title: "بوابات دفع متعددة", desc: "Stripe, PayPal, وغيرها" },
      ],
    },
    templates: {
      title: "القوالب الجاهزة",
      subtitle: "اختر من مجموعة قوالب احترافية جاهزة للاستخدام",
      preview: "معاينة",
      useTemplate: "استخدم هذا القالب",
      items: [
        { name: "متجر الكتب الإلكترونية", category: "كتب" },
        { name: "منصة الدورات", category: "تعليم" },
        { name: "متجر التصاميم", category: "تصميم" },
        { name: "متجر البرمجيات", category: "برمجة" },
      ],
    },
    steps: {
      title: "أنشئ متجرك بـ3 خطوات بسيطة لإطلاق مشروعك",
      items: [
        { title: "أنشئ حسابك", desc: "سجل مجاناً في أقل من دقيقة" },
        { title: "أضف المنتجات", desc: "ارفع ملفاتك وحدد أسعارك" },
        { title: "ابدأ البيع", desc: "شارك متجرك واستقبل المدفوعات" },
      ],
    },
    features: {
      title: "مميزات تقنية متقدمة",
      items: [
        { title: "لوحة تحكم متقدمة", desc: "إحصائيات ومبيعات في الوقت الفعلي" },
        { title: "تخصيص كامل", desc: "غير الألوان والخطوط والتخطيط" },
        { title: "SEO محسن", desc: "ظهور أفضل في محركات البحث" },
        { title: "سرعة فائقة", desc: "تحميل سريع لتجربة أفضل" },
      ],
    },
    integrations: {
      title: "تكامل مع أهم الأدوات",
      subtitle: "اربط متجرك بأدوات التسويق والتحليل المفضلة لديك",
    },
    testimonials: {
      title: "ماذا يقول عملاؤنا؟",
      items: [
        { name: "أحمد محمد", role: "مؤلف كتب", text: "أفضل منصة استخدمتها لبيع كتبي الإلكترونية" },
        { name: "سارة علي", role: "مصممة", text: "سهلت علي بيع قوالب التصميم بشكل احترافي" },
        { name: "خالد حسن", role: "مدرب", text: "منصة رائعة لبيع الدورات التدريبية" },
      ],
    },
    stats: {
      merchants: "+15,000",
      merchantsLabel: "تاجر نشط",
      revenue: "+10 مليون ريال",
      revenueLabel: "حجم المبيعات",
      uptime: "99.9%",
      uptimeLabel: "وقت التشغيل",
      support: "24/7",
      supportLabel: "دعم فني",
    },
    cta: {
      title: "جاهز لإطلاق مشروعك؟",
      subtitle: "ابدأ تجربتك المجانية اليوم",
      button: "أطلق مشروعك الآن",
    },
    footer: {
      about: "منصة عربية متكاملة لإنشاء وإدارة المتاجر الرقمية",
      links: "روابط سريعة",
      privacy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
      contact: "اتصل بنا",
      rights: "© 2025 جميع الحقوق محفوظة",
    },
  },
  en: {
    nav: {
      templates: "Templates",
      pricing: "Pricing",
      blog: "Blog",
      login: "Login",
      dashboard: "Dashboard",
    },
    hero: {
      badge: "Digital Store Platform",
      title: "Launch Your Digital Project in Minutes",
      subtitle: "Complete platform to create your online store for selling digital products - books, courses, templates, software",
      cta: "Start Your Project",
      viewTemplates: "View Templates",
    },
    why: {
      title: "Why Blzr?",
      subtitle: "Everything you need to launch your digital store in one place",
      features: [
        { title: "No Hidden Fees", desc: "No commission on your sales" },
        { title: "24/7 Support", desc: "Support team available around the clock" },
        { title: "File Protection", desc: "Secure and temporary download links" },
        { title: "Multiple Payment Gateways", desc: "Stripe, PayPal, and more" },
      ],
    },
    templates: {
      title: "Ready Templates",
      subtitle: "Choose from professional templates ready to use",
      preview: "Preview",
      useTemplate: "Use This Template",
      items: [
        { name: "E-Books Store", category: "Books" },
        { name: "Courses Platform", category: "Education" },
        { name: "Designs Store", category: "Design" },
        { name: "Software Store", category: "Development" },
      ],
    },
    steps: {
      title: "Create your store in 3 simple steps to launch your project",
      items: [
        { title: "Create Account", desc: "Sign up free in less than a minute" },
        { title: "Add Products", desc: "Upload files and set prices" },
        { title: "Start Selling", desc: "Share your store and receive payments" },
      ],
    },
    features: {
      title: "Advanced Technical Features",
      items: [
        { title: "Advanced Dashboard", desc: "Real-time stats and sales" },
        { title: "Full Customization", desc: "Change colors, fonts, and layout" },
        { title: "Optimized SEO", desc: "Better visibility in search engines" },
        { title: "Super Fast", desc: "Fast loading for better experience" },
      ],
    },
    integrations: {
      title: "Integration with Top Tools",
      subtitle: "Connect your store with your favorite marketing and analytics tools",
    },
    testimonials: {
      title: "What Our Customers Say?",
      items: [
        { name: "Ahmed Mohamed", role: "Author", text: "Best platform I've used to sell my e-books" },
        { name: "Sara Ali", role: "Designer", text: "Made selling design templates so professional" },
        { name: "Khaled Hassan", role: "Trainer", text: "Great platform for selling courses" },
      ],
    },
    stats: {
      merchants: "+15,000",
      merchantsLabel: "Active Merchants",
      revenue: "+$2.5M",
      revenueLabel: "Sales Volume",
      uptime: "99.9%",
      uptimeLabel: "Uptime",
      support: "24/7",
      supportLabel: "Support",
    },
    cta: {
      title: "Ready to Launch?",
      subtitle: "Start your free trial today",
      button: "Launch Your Project Now",
    },
    footer: {
      about: "Complete Arabic platform for creating and managing digital stores",
      links: "Quick Links",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      contact: "Contact Us",
      rights: "© 2025 All rights reserved",
    },
  },
};

export function getTranslation(lang: Language) {
  return translations[lang];
}
