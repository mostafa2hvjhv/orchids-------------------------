"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowRight, 
  Save, 
  Eye, 
  Upload, 
  Globe, 
  Lock, 
  DollarSign, 
  FileText,
    Check,
    X,
    Plus,
    Monitor,
    Tablet,
    Smartphone,
    Loader2
  } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export default function ProductEditorPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const isEditing = params.id && params.id !== "new";
  
  const [loading, setLoading] = useState(isEditing ? true : false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  
  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "",
    price: 0,
    sale_price: 0,
    status: "draft",
    images: [] as string[],
    file_url: "",
    download_limit: 0,
    expiry_days: 0,
  });

  useEffect(() => {
    if (clerkLoaded) {
      if (!clerkUser) {
        router.push("/store-owner-login");
        return;
      }
      if (isEditing) {
        fetchProduct();
      }
    }
  }, [isEditing, clerkLoaded, clerkUser]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setProduct(prev => ({
        ...prev,
        images: [...prev.images, publicUrl]
      }));
      toast.success("تم رفع الصورة بنجاح");
    } catch (error: any) {
      toast.error("فشل رفع الصورة: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setProduct(prev => ({
        ...prev,
        file_url: publicUrl
      }));
      toast.success("تم رفع الملف بنجاح");
    } catch (error: any) {
      toast.error("فشل رفع الملف: " + error.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const removeImage = (index: number) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single();
    
    if (data) setProduct(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!clerkUser) throw new Error("يجب تسجيل الدخول أولاً");

      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("owner_id", clerkUser.id)
        .single();

      if (!store) throw new Error("لم يتم العثور على متجر");

      const payload = { ...product, store_id: store.id };

      let error;
      if (isEditing) {
        ({ error } = await supabase.from("products").update(payload).eq("id", params.id));
      } else {
        ({ error } = await supabase.from("products").insert(payload));
      }

      if (error) throw error;
      toast.success(isEditing ? "تم تحديث المنتج" : "تم إنشاء المنتج بنجاح");
      router.push("/dashboard/products");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Top Bar */}
      <header className="h-20 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/products")}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{isEditing ? "تعديل المنتج" : "إضافة منتج جديد"}</h1>
            <p className="text-xs text-zinc-500">{product.name || "بدون اسم"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg gap-1 ml-4">
            <Button 
              variant={previewDevice === "desktop" ? "secondary" : "ghost"} 
              size="icon" className="w-8 h-8" 
              onClick={() => setPreviewDevice("desktop")}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button 
              variant={previewDevice === "tablet" ? "secondary" : "ghost"} 
              size="icon" className="w-8 h-8"
              onClick={() => setPreviewDevice("tablet")}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button 
              variant={previewDevice === "mobile" ? "secondary" : "ghost"} 
              size="icon" className="w-8 h-8"
              onClick={() => setPreviewDevice("mobile")}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" className="gap-2">
            <Eye className="w-4 h-4" /> معاينة
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 px-6">
            <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Side */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-8">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start h-12 bg-transparent border-b border-zinc-200 dark:border-zinc-800 rounded-none p-0 gap-8">
                <TabsTrigger value="details" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-0 font-bold">تفاصيل المنتج</TabsTrigger>
                <TabsTrigger value="files" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-0 font-bold">إدارة الملفات</TabsTrigger>
                <TabsTrigger value="pricing" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-0 font-bold">التسعير</TabsTrigger>
                <TabsTrigger value="delivery" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-0 font-bold">إعدادات التسليم</TabsTrigger>
              </TabsList>

              <div className="py-8">
                <TabsContent value="details" className="space-y-6 m-0">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
                      <CardDescription>أدخل اسم المنتج ووصفه وتصنيفه</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>اسم المنتج</Label>
                        <Input 
                          placeholder="مثلاً: كتاب التسويق الاحترافي" 
                          value={product.name}
                          onChange={e => setProduct({ ...product, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>وصف المنتج</Label>
                        <textarea 
                          className="w-full min-h-[150px] p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm"
                          placeholder="اشرح لعملائك مميزات هذا المنتج..."
                          value={product.description}
                          onChange={e => setProduct({ ...product, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>التصنيف</Label>
                        <Select value={product.category} onValueChange={val => setProduct({ ...product, category: val })}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر تصنيفاً" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="books">كتب إلكترونية</SelectItem>
                            <SelectItem value="courses">دورات تدريبية</SelectItem>
                            <SelectItem value="templates">قوالب وتصاميم</SelectItem>
                            <SelectItem value="software">برمجيات</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">صور المنتج</CardTitle>
                      <CardDescription>ارفع صوراً جذابة لزيادة مبيعاتك</CardDescription>
                    </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <label className="aspect-square border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-zinc-400">
                            <Plus className="w-6 h-6" />
                            <span className="text-[10px] font-bold">{uploadingImage ? "جاري الرفع..." : "إضافة صورة"}</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                          </label>
                          {product.images.map((img, i) => (
                            <div key={i} className="aspect-square rounded-xl overflow-hidden relative group border border-zinc-200">
                              <img src={img} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button variant="destructive" size="icon" className="w-8 h-8" onClick={() => removeImage(i)}>
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>

                  </Card>
                </TabsContent>

                  <TabsContent value="files" className="space-y-6 m-0">
                    <Card className="border-none shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">الملف الرقمي</CardTitle>
                        <CardDescription>ارفع الملف الذي سيحصل عليه العميل بعد الشراء</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <label className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center space-y-4 block cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                          <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
                          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                            {uploadingFile ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                          </div>
                          <div>
                            <p className="font-bold">{product.file_url ? "تم رفع الملف بنجاح" : "انقر للرفع أو اسحب الملف هنا"}</p>
                            <p className="text-xs text-zinc-500">الحد الأقصى 100 ميجابايت (PDF, ZIP, MP4, etc.)</p>
                          </div>
                          {product.file_url && (
                            <div className="text-xs text-green-600 font-bold truncate max-w-xs mx-auto">
                              {product.file_url}
                            </div>
                          )}
                        </label>


                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
                        <span className="text-xs text-zinc-400 font-bold">أو استخدم رابط خارجي</span>
                        <div className="h-px flex-1 bg-zinc-100 dark:border-zinc-800" />
                      </div>

                      <div className="space-y-2">
                        <Label>رابط الملف (Google Drive, Dropbox, etc.)</Label>
                        <div className="relative">
                          <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <Input 
                            placeholder="https://drive.google.com/..." 
                            className="pr-10 dir-ltr text-left" 
                            value={product.file_url}
                            onChange={e => setProduct({ ...product, file_url: e.target.value })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-6 m-0">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">إعدادات التسعير</CardTitle>
                      <CardDescription>حدد سعر المنتج والخصومات المتوفرة</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>السعر الأساسي (ر.س)</Label>
                        <div className="relative">
                          <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <Input 
                            type="number" 
                            className="pr-10" 
                            value={product.price}
                            onChange={e => setProduct({ ...product, price: parseFloat(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>سعر التخفيض (اختياري)</Label>
                        <div className="relative">
                          <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <Input 
                            type="number" 
                            className="pr-10" 
                            value={product.sale_price}
                            onChange={e => setProduct({ ...product, sale_price: parseFloat(e.target.value) })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="delivery" className="space-y-6 m-0">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">قيود التحميل</CardTitle>
                      <CardDescription>تحكم في كيفية وصول العميل لملفاته</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>حد التحميل (0 لغير محدود)</Label>
                        <Input 
                          type="number" 
                          value={product.download_limit}
                          onChange={e => setProduct({ ...product, download_limit: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>صلاحية الرابط (بالأيام)</Label>
                        <Input 
                          type="number" 
                          value={product.expiry_days}
                          onChange={e => setProduct({ ...product, expiry_days: parseInt(e.target.value) })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Preview Side */}
        <div className="hidden xl:flex w-[450px] border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50 flex-col">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold uppercase tracking-wider text-zinc-500">
            معاينة مباشرة للمنتج
          </div>
          <div className="flex-1 p-8 flex items-start justify-center overflow-y-auto">
            <div className={`bg-white dark:bg-zinc-900 shadow-2xl rounded-[2rem] border-8 border-zinc-900 dark:border-zinc-800 overflow-hidden transition-all duration-500 ${
              previewDevice === "desktop" ? "w-full aspect-[4/5]" : 
              previewDevice === "tablet" ? "w-[340px] aspect-[3/4]" : 
              "w-[260px] aspect-[9/19] rounded-[3rem]"
            }`}>
              {/* Product Card Preview */}
              <div className="h-full flex flex-col">
                <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                  {product.images[0] ? (
                    <img src={product.images[0]} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-12 h-12 opacity-20" />
                  )}
                </div>
                <div className="p-6 space-y-4 flex-1">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{product.category || "التصنيف"}</div>
                    <h3 className="text-xl font-black leading-tight">{product.name || "اسم المنتج يظهر هنا"}</h3>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">
                    {product.description || "هنا سيظهر وصف المنتج الذي ستقوم بكتابته في المحرر..."}
                  </p>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      {product.sale_price > 0 && (
                        <span className="text-[10px] text-zinc-400 line-through">{product.price} ر.س</span>
                      )}
                      <span className="text-lg font-black">{product.sale_price || product.price || 0} ر.س</span>
                    </div>
                    <Button size="sm" className="h-8 px-4 text-[10px] font-bold uppercase tracking-wider">شراء الآن</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Trash(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function Package(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
