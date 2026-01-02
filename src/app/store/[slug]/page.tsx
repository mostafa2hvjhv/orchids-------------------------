"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { stripePromise } from "@/lib/stripe-client";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useParams, useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Star, 
  Globe,
  Lock,
  Download,
  Info,
  Plus,
  Minus,
  Trash2,
  X,
  CreditCard,
  Loader2,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface CartItem {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  image?: string;
}

function CheckoutForm({ 
  onSuccess, 
  orderId 
}: { 
  onSuccess: (orderId: string) => void;
  orderId: string;
}) {
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
      onSuccess(orderId);
    } else {
      setError('الدفع قيد المعالجة، يرجى الانتظار');
    }
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-h-[350px] overflow-y-auto">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      <Button 
        type="submit" 
        className="w-full h-12 text-lg gap-2" 
        disabled={!stripe || !elements || processing}
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> جاري المعالجة...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" /> إتمام الشراء
          </>
        )}
      </Button>
    </form>
  );
}

export default function StorefrontPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    fetchStoreData();
  }, [slug]);

  const fetchStoreData = async () => {
    const { data: storeData } = await supabase
      .from("stores")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!storeData) {
      toast.error("المتجر غير موجود");
      router.push("/");
      return;
    }

    setStore(storeData);

    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeData.id)
      .eq("status", "published");

    setProducts(productsData || []);
    setLoading(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      toast.info("المنتج موجود بالفعل في السلة");
      return;
    }
    setCart([...cart, {
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.sale_price,
      image: product.images?.[0],
    }]);
    toast.success("تمت الإضافة إلى السلة");
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => {
    return sum + (item.salePrice && item.salePrice > 0 ? item.salePrice : item.price);
  }, 0);

  const handleStartCheckout = async () => {
    if (!customerEmail) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          productIds: cart.map(item => item.id),
          customerEmail,
          customerName,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setShowCheckout(true);
    } catch (error: any) {
      toast.error(error.message || "فشل في بدء عملية الدفع");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePaymentSuccess = async (completedOrderId: string) => {
    await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', completedOrderId);

    setPaymentSuccess(true);
    setCart([]);
    setShowCart(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-100 dark:border-zinc-900 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 dark:bg-zinc-50 rounded-xl flex items-center justify-center overflow-hidden">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="text-white dark:text-zinc-900 w-6 h-6" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-black leading-none">{store.name}</h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">متجر رقمي معتمد</p>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input 
                placeholder="البحث في المتجر..." 
                className="pr-10 bg-zinc-50 dark:bg-zinc-900 border-none h-10" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setShowCart(true)}
            >
              <ShoppingBag className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-[10px] flex items-center justify-center rounded-full font-bold">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <section className="py-16 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black mb-4">{store.name}</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
              {store.description || "أهلاً بك في متجرنا. نحن نقدم أفضل المنتجات الرقمية بجودة عالية وضمان تام."}
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Globe className="w-4 h-4" /> يشحن لجميع دول العالم
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Lock className="w-4 h-4" /> دفع آمن 100%
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Download className="w-4 h-4" /> تحميل فوري بعد الدفع
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-2xl font-black">منتجاتنا ({filteredProducts.length})</h3>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" /> ترتيب حسب الأحدث
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group border-none shadow-none hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/30">
              <CardContent className="p-0">
                <div className="aspect-[4/5] overflow-hidden relative">
                  {product.images?.[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform duration-700">
                      <ShoppingBag className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {product.sale_price > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">خصم {Math.round((1 - product.sale_price / product.price) * 100)}%</span>
                    )}
                    <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-full text-zinc-900 dark:text-zinc-100 border border-zinc-200/50 dark:border-zinc-700/50">{product.category}</span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="text-lg font-black group-hover:text-zinc-600 transition-colors line-clamp-1">{product.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-[10px] text-zinc-400 font-bold mr-1">(12 تقييم)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {product.sale_price > 0 && (
                        <span className="text-[10px] text-zinc-400 line-through leading-none mb-0.5">{product.price} ر.س</span>
                      )}
                      <span className="text-xl font-black">{product.sale_price || product.price} ر.س</span>
                    </div>
                    <Button 
                      size="icon" 
                      className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:scale-110 transition-transform"
                      onClick={() => addToCart(product)}
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-400">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-2">لا توجد منتجات حالياً</h3>
            <p className="text-zinc-500">تابع المتجر للحصول على تحديثات عند إضافة منتجات جديدة.</p>
          </div>
        )}
      </main>

      <footer className="py-20 border-t border-zinc-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-50 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-white dark:text-zinc-900 w-5 h-5" />
              </div>
              <span className="font-black text-lg">{store.name}</span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {store.description}
            </p>
          </div>
          
          <div className="space-y-6">
            <h5 className="font-bold text-sm uppercase tracking-widest text-zinc-400">روابط سريعة</h5>
            <ul className="space-y-3 text-sm font-medium">
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">سياسة الخصوصية</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">شروط الاستخدام</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">سياسة الاسترجاع</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="font-bold text-sm uppercase tracking-widest text-zinc-400">تحتاج مساعدة؟</h5>
            <p className="text-sm text-zinc-500">فريق الدعم متواجد للرد على استفساراتكم على مدار الساعة.</p>
            <Button className="w-full h-12 gap-2">
              <Info className="w-4 h-4" /> تواصل معنا
            </Button>
          </div>
        </div>
      </footer>

      {showCart && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl overflow-auto">
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 p-4 flex items-center justify-between">
              <h3 className="text-xl font-black">سلة التسوق ({cart.length})</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {paymentSuccess ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-black mb-2">تم الشراء بنجاح!</h3>
                <p className="text-zinc-500 mb-6">شكراً لك. تم إرسال روابط التحميل إلى بريدك الإلكتروني.</p>
                <Button onClick={() => router.push(`/store/${slug}/downloads?order=${orderId}`)} className="gap-2">
                  <Download className="w-4 h-4" /> تحميل الملفات
                </Button>
              </div>
            ) : showCheckout && clientSecret ? (
              <div className="p-4 space-y-4">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">المجموع</span>
                    <span className="font-bold">{cartTotal} ر.س</span>
                  </div>
                </div>
                <Elements 
                  stripe={stripePromise} 
                  options={{ 
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#18181b',
                        fontFamily: 'Cairo, sans-serif',
                      },
                    },
                    locale: 'ar',
                  }}
                >
                  <CheckoutForm 
                    onSuccess={handlePaymentSuccess} 
                    orderId={orderId!}
                  />
                </Elements>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setShowCheckout(false)}
                >
                  العودة للسلة
                </Button>
              </div>
            ) : (
              <>
                <div className="p-4 space-y-4">
                  {cart.length === 0 ? (
                    <div className="py-16 text-center">
                      <ShoppingBag className="w-16 h-16 mx-auto text-zinc-200 dark:text-zinc-700 mb-4" />
                      <p className="text-zinc-500">السلة فارغة</p>
                    </div>
                  ) : (
                    <>
                      {cart.map(item => (
                        <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-700 shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-zinc-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate">{item.name}</h4>
                            <p className="text-lg font-black mt-1">
                              {item.salePrice && item.salePrice > 0 ? item.salePrice : item.price} ر.س
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}

                      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">البريد الإلكتروني *</label>
                          <Input 
                            type="email" 
                            placeholder="email@example.com" 
                            value={customerEmail}
                            onChange={e => setCustomerEmail(e.target.value)}
                            className="text-left dir-ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">الاسم (اختياري)</label>
                          <Input 
                            placeholder="الاسم الكامل" 
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="sticky bottom-0 p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                    <div className="flex justify-between text-lg font-black">
                      <span>المجموع</span>
                      <span>{cartTotal} ر.س</span>
                    </div>
                    <Button 
                      className="w-full h-12 text-lg gap-2" 
                      onClick={handleStartCheckout}
                      disabled={checkoutLoading || !customerEmail}
                    >
                      {checkoutLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> جاري التحميل...
                        </>
                      ) : (
                        <>
                          المتابعة للدفع <ArrowRight className="w-5 h-5 rotate-180" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
