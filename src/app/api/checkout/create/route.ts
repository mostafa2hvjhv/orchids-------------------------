import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { storeId, productIds, customerEmail, customerName } = await req.json();

    if (!storeId || !productIds?.length) {
      return NextResponse.json(
        { error: 'معرف المتجر والمنتجات مطلوبة' },
        { status: 400 }
      );
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('store_id', storeId);

    if (productsError || !products?.length) {
      return NextResponse.json(
        { error: 'لم يتم العثور على المنتجات' },
        { status: 404 }
      );
    }

    const { data: store } = await supabase
      .from('stores')
      .select('name, currency')
      .eq('id', storeId)
      .single();

    const totalAmount = products.reduce((sum, product) => {
      const price = product.sale_price && product.sale_price > 0 
        ? product.sale_price 
        : product.price;
      return sum + Number(price);
    }, 0);

    const currency = store?.currency?.toLowerCase() || 'sar';
    const amountInSubunits = Math.round(totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSubunits,
      currency,
      metadata: {
        store_id: storeId,
        product_ids: JSON.stringify(productIds),
        customer_email: customerEmail || '',
        customer_name: customerName || '',
        type: 'product_purchase',
      },
      description: `شراء من ${store?.name || 'متجر رقمي'}`,
    });

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id: storeId,
        total_amount: totalAmount,
        currency: currency.toUpperCase(),
        status: 'pending',
        payment_intent_id: paymentIntent.id,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error('فشل في إنشاء الطلب');
    }

    const orderItems = products.map(product => ({
      order_id: order.id,
      product_id: product.id,
      price: product.sale_price && product.sale_price > 0 
        ? product.sale_price 
        : product.price,
    }));

    await supabase.from('order_items').insert(orderItems);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order.id,
      amount: totalAmount,
      currency: currency.toUpperCase(),
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء عملية الدفع' },
      { status: 500 }
    );
  }
}
