"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Upload, 
  Plus, 
  Loader2, 
  Image as ImageIcon, 
  FileText, 
  Check,
  Package,
  DollarSign,
  Tag,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

export default function NewProductPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    status: "published",
    images: [] as string[],
    file_url: "",
  });

  useEffect(() => {
    if (clerkLoaded) {
      if (!clerkUser) {
        router.push("/store-owner-login");
        return;
      }
      fetchStore();
    }
  }, [clerkLoaded, clerkUser]);

  const fetchStore = async () => {
    if (!clerkUser) return;
    const { data: store, error } = await supabase
      .from("stores")
      .select("id")
      .eq("owner_id", clerkUser.id)
      .single();
    
    if (error || !store) {
      toast.error("لم يتم العثور على متجرك. يرجى إكمال التسجيل أولاً.");
      router.push("/store-registration");
      return;
    }
    setStoreId(store.id);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file || !storeId) return;

    setUploading(type);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const bucket = type === 'image' ? 'product-images' : 'product-files';
      const filePath = `${storeId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (type === 'image') {
        setFormData(prev => ({ ...prev, images: [...prev.images, publicUrl] }));
        toast.success("تم رفع الصورة بنجاح");
      } else {
        setFormData(prev => ({ ...prev, file_url: publicUrl }));
        toast.success("تم رفع الملف الرقمي بنجاح");
      }
    } catch (error: any) {
      toast.error(`فشل الرفع: ${error.message}`);
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;

    if (!formData.name || !formData.price || !formData.file_url) {
      toast.error("يرجى ملء الحقول الأساسية ورفع الملف الرقمي");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("products").insert({
        store_id: storeId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        status: formData.status,
        images: formData.images,
        file_url: formData.file_url,
      });

      if (error) throw error;

      toast.success("تم إنشاء المنتج بنجاح!");
      router.push("/dashboard/products");
    } catch (error: any) {
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!clerkLoaded || !storeId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-900 dark:text-zinc-50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 font-cairo">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
              <button onClick={() => router.push("/dashboard/products")} className="hover:text-zinc-900 flex items-center gap-1 transition-colors">
                المنتجات
              </button>
              <ArrowRight className="w-4 h-4" />
              <span className="text-zinc-900 font-bold dark:text-zinc-50">منتج جديد</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">إضافة منتج رقمي</h1>
          </div>
          <Button variant="ghost" onClick={() => router.push("/dashboard/products")} className="gap-2 font-bold h-12 px-6">
            إلغاء
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Package className="w-5 h-5" /> المعلومات الأساسية
                </CardTitle>
                <CardDescription>أدخل تفاصيل منتجك التي ستظهر للعملاء</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-black">اسم المنتج</Label>
                  <Input 
                    placeholder="مثلاً: كتاب تعلم البرمجة من الصفر" 
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none text-lg font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-black">وصف المنتج</Label>
                  <Textarea 
                    placeholder="اشرح لعملائك مميزات هذا المنتج..." 
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[160px] rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none text-base leading-relaxed resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-black">السعر (ر.س)</Label>
                    <div className="relative">
                      <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={formData.price}
                        onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="h-14 pr-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none text-lg font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-black">الفئة</Label>
                    <Select onValueChange={val => setFormData(prev => ({ ...prev, category: val }))} value={formData.category}>
                      <SelectTrigger className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none text-lg font-bold">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="books">كتب إلكترونية</SelectItem>
                        <SelectItem value="courses">دورات</SelectItem>
                        <SelectItem value="software">برمجيات</SelectItem>
                        <SelectItem value="assets">ملفات تصميم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" /> صور المنتج
                </CardTitle>
                <CardDescription>أضف صوراً توضح جودة عملك (حتى 4 صور)</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {formData.images.map((img, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="aspect-square rounded-2xl overflow-hidden relative group"
                      >
                        <img src={img} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          حذف
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {formData.images.length < 4 && (
                    <label className="aspect-square rounded-2xl border-4 border-dashed border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group">
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'image')} disabled={!!uploading} />
                      {uploading === 'image' ? (
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                      ) : (
                        <>
                          <Plus className="w-8 h-8 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                          <span className="text-[10px] font-black text-zinc-400 mt-2 uppercase tracking-widest">إضافة صورة</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="border-none shadow-xl bg-zinc-900 text-white rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-zinc-400" /> الملف الرقمي
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <label className={`w-full h-40 rounded-2xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-zinc-800 relative overflow-hidden ${formData.file_url ? 'bg-zinc-800/50 border-green-500/50' : ''}`}>
                  <input type="file" className="hidden" onChange={e => handleFileUpload(e, 'file')} disabled={!!uploading} />
                  {uploading === 'file' ? (
                    <Loader2 className="w-10 h-10 animate-spin text-white" />
                  ) : formData.file_url ? (
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6 text-green-500" />
                      </div>
                      <p className="text-sm font-bold text-green-500">تم رفع الملف بنجاح</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">انقر للتغيير</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6 text-zinc-400" />
                      </div>
                      <p className="text-sm font-bold">ارفع ملفك هنا</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">PDF, ZIP, MP4...</p>
                    </div>
                  )}
                </label>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Tag className="w-5 h-5" /> حالة النشر
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant={formData.status === "published" ? "default" : "outline"}
                    className="flex-1 h-12 rounded-xl font-bold"
                    onClick={() => setFormData(prev => ({ ...prev, status: "published" }))}
                  >
                    منشور
                  </Button>
                  <Button 
                    type="button"
                    variant={formData.status === "draft" ? "default" : "outline"}
                    className="flex-1 h-12 rounded-xl font-bold"
                    onClick={() => setFormData(prev => ({ ...prev, status: "draft" }))}
                  >
                    مسودة
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Button 
                  type="submit" 
                  disabled={loading || uploading !== null}
                  className="w-full h-16 text-xl font-black rounded-2xl bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all gap-3"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "إنشاء المنتج"}
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
