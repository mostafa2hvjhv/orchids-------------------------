"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
    Package, 
    Search, 
    Filter, 
    MoreVertical, 
    Edit, 
    Trash, 
    Copy, 
    ExternalLink,
    Plus,
    ArrowRight,
    Download,
    Eye
  } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
  } from "@/components/ui/dropdown-menu";
  import { toast } from "sonner";
  import { useUser } from "@clerk/nextjs";
  
  export default function ProductsPage() {
    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const router = useRouter();
  
    useEffect(() => {
      if (clerkLoaded) {
        if (!clerkUser) {
          router.push("/store-owner-login");
          return;
        }
        fetchProducts();
      }
    }, [clerkLoaded, clerkUser]);
  
    const fetchProducts = async () => {
      if (!clerkUser) return;
  
      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("owner_id", clerkUser.id)
        .single();


    if (store) {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false });
      
      setProducts(data || []);
    }
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("حدث خطأ أثناء الحذف");
    else {
      toast.success("تم حذف المنتج بنجاح");
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <button onClick={() => router.push("/dashboard")} className="hover:text-zinc-900">لوحة التحكم</button>
              <ArrowRight className="w-4 h-4" />
              <span className="text-zinc-900 font-bold">المنتجات</span>
            </div>
            <h1 className="text-3xl font-black">إدارة المنتجات</h1>
          </div>
          <Button onClick={() => router.push("/dashboard/products/new")} className="h-12 px-6 gap-2">
            <Plus className="w-5 h-5" /> إضافة منتج جديد
          </Button>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="p-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input 
                  placeholder="البحث عن منتج..." 
                  className="pr-10 bg-zinc-50 dark:bg-zinc-800 border-none" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" /> تصفية
                </Button>
                <Button variant="outline" onClick={fetchProducts}>تحديث</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">المنتج</th>
                    <th className="px-6 py-4">الفئة</th>
                    <th className="px-6 py-4">السعر</th>
                    <th className="px-6 py-4">المبيعات</th>
                    <th className="px-6 py-4">الحالة</th>
                    <th className="px-6 py-4 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-400">جاري التحميل...</td></tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                          <Package className="w-16 h-16" />
                          <p className="text-lg font-bold">لا يوجد منتجات حالياً</p>
                          <Button variant="link" onClick={() => router.push("/dashboard/products/new")}>أضف أول منتج لك الآن</Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-6 h-6 text-zinc-400" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-bold group-hover:text-zinc-900 dark:group-hover:text-zinc-100">{product.name}</div>
                              <div className="text-[10px] text-zinc-400 font-mono">ID: {product.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">{product.category || "غير مصنف"}</td>
                        <td className="px-6 py-4 text-sm font-bold">{product.price} ر.س</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Download className="w-3 h-3 text-zinc-400" />
                            <span>124 مبيعة</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                            product.status === "published" ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
                          }`}>
                            {product.status === "published" ? "منشور" : "مسودة"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-8 h-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-40">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${product.id}`)}>
                                <Edit className="w-4 h-4 ml-2" /> تعديل
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 ml-2" /> نسخ
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 ml-2" /> معاينة
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => deleteProduct(product.id)}>
                                <Trash className="w-4 h-4 ml-2" /> حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
