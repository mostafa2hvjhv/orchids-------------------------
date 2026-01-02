"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useSearchParams } from "next/navigation";
import { Download, FileText, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface DownloadItem {
  id: string;
  name: string;
  fileUrl: string | null;
  downloadLimit: number | null;
  expiryDays: number | null;
}

export default function DownloadsPage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    } else {
      setError("لم يتم العثور على الطلب");
      setLoading(false);
    }
  }, [orderId, slug]);

  const fetchOrderData = async () => {
    try {
      const { data: storeData } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!storeData) {
        setError("المتجر غير موجود");
        setLoading(false);
        return;
      }
      setStore(storeData);

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("store_id", storeData.id)
        .single();

      if (orderError || !orderData) {
        setError("لم يتم العثور على الطلب");
        setLoading(false);
        return;
      }

      if (orderData.status !== "completed") {
        setError("الطلب غير مكتمل بعد");
        setLoading(false);
        return;
      }

      setOrder(orderData);

      const { data: orderItems } = await supabase
        .from("order_items")
        .select(`
          id,
          product_id,
          products (
            id,
            name,
            file_url,
            download_limit,
            expiry_days
          )
        `)
        .eq("order_id", orderId);

      const downloadItems: DownloadItem[] = (orderItems || []).map((item: any) => ({
        id: item.products?.id || item.product_id,
        name: item.products?.name || "منتج",
        fileUrl: item.products?.file_url,
        downloadLimit: item.products?.download_limit,
        expiryDays: item.products?.expiry_days,
      }));

      setItems(downloadItems);
    } catch (err) {
      setError("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileUrl: string | null, name: string) => {
    if (!fileUrl) {
      return;
    }
    window.parent.postMessage({ 
      type: "OPEN_EXTERNAL_URL", 
      data: { url: fileUrl } 
    }, "*");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">{error}</h2>
            <p className="text-zinc-500 mb-6">يرجى التحقق من رابط الطلب أو التواصل مع الدعم.</p>
            <Link href={`/store/${slug}`}>
              <Button className="gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" /> العودة للمتجر
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-black mb-2">شكراً لك على الشراء!</h1>
            <p className="text-zinc-500">تم استلام طلبك بنجاح. يمكنك تحميل ملفاتك من هنا.</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Download className="w-5 h-5" /> ملفاتك ({items.length})
          </h2>

          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{item.name}</h3>
                    <div className="flex gap-4 text-xs text-zinc-500 mt-1">
                      {item.downloadLimit && (
                        <span>حد التحميل: {item.downloadLimit} مرات</span>
                      )}
                      {item.expiryDays && (
                        <span>صالح لمدة: {item.expiryDays} يوم</span>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleDownload(item.fileUrl, item.name)}
                    disabled={!item.fileUrl}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" /> تحميل
                  </Button>
                </div>
                {!item.fileUrl && (
                  <div className="px-4 pb-4">
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm">
                      الملف غير متوفر حالياً. يرجى التواصل مع صاحب المتجر.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {items.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                <p className="text-zinc-500">لا توجد ملفات للتحميل</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href={`/store/${slug}`}>
            <Button variant="outline" className="gap-2">
              <ArrowRight className="w-4 h-4 rotate-180" /> العودة للمتجر
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
