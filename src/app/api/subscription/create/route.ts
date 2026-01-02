import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRO_PLAN_PRICE_SAR } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getOrCreateProPlanPrice() {
  const products = await stripe.products.list({ limit: 10 });
  let proProduct = products.data.find(p => p.metadata?.plan === 'pro');

  if (!proProduct) {
    proProduct = await stripe.products.create({
      name: 'الخطة الاحترافية',
      description: 'اشتراك شهري في الخطة الاحترافية للمتجر',
      metadata: { plan: 'pro' },
    });
  }

  const prices = await stripe.prices.list({ product: proProduct.id, active: true, limit: 5 });
  let proPrice = prices.data.find(p => 
    p.unit_amount === PRO_PLAN_PRICE_SAR && 
    p.recurring?.interval === 'month'
  );

  if (!proPrice) {
    proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: PRO_PLAN_PRICE_SAR,
      currency: 'usd',
      recurring: { interval: 'month' },
    });
  }

  return proPrice.id;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { storeId, email } = await req.json();

    if (!storeId || !email) {
      return NextResponse.json(
        { error: 'معرف المتجر والبريد الإلكتروني مطلوبان' },
        { status: 400 }
      );
    }

    const priceId = await getOrCreateProPlanPrice();

    const customer = await stripe.customers.create({
      email,
      metadata: {
        store_id: storeId,
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: PRO_PLAN_PRICE_SAR,
      currency: 'usd',
      customer: customer.id,
      setup_future_usage: 'off_session',
      metadata: {
        store_id: storeId,
        type: 'subscription_initial',
        price_id: priceId,
      },
      description: 'الخطة الاحترافية - الشهر الأول',
    });

      await supabase.from('subscriptions').insert({
        store_id: storeId,
        user_id: userId,
        plan_id: 'pro',
        status: 'pending',
      });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
      priceId: priceId,
    });
  } catch (error: any) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء الاشتراك' },
      { status: 500 }
    );
  }
}
