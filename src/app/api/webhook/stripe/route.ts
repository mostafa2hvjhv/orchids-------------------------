import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  console.log('Received Stripe event:', event.type);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const storeId = subscription.metadata?.store_id;

        if (!storeId) {
          console.error('No store_id in subscription metadata');
          break;
        }

        const status = subscription.status === 'active' ? 'active' : 
                       subscription.status === 'canceled' ? 'canceled' :
                       subscription.status === 'past_due' ? 'past_due' : 'pending';

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
        }

        if (status === 'active') {
          await supabase
            .from('stores')
            .update({ subscription_plan: 'pro' })
            .eq('id', storeId);
        }

        console.log(`Subscription ${subscription.id} updated to status: ${status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const storeId = subscription.metadata?.store_id;

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);

        if (storeId) {
          await supabase
            .from('stores')
            .update({ subscription_plan: 'free' })
            .eq('id', storeId);
        }

        console.log(`Subscription ${subscription.id} canceled`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId);

          console.log(`Subscription ${subscriptionId} marked as past_due`);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const metadata = paymentIntent.metadata;

        if (metadata?.type === 'product_purchase') {
          const { error: updateError } = await supabase
            .from('orders')
            .update({ status: 'completed' })
            .eq('payment_intent_id', paymentIntent.id);

          if (updateError) {
            console.error('Error updating order:', updateError);
          } else {
            console.log(`Order with payment_intent ${paymentIntent.id} marked as completed`);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const metadata = paymentIntent.metadata;

        if (metadata?.type === 'product_purchase') {
          await supabase
            .from('orders')
            .update({ status: 'failed' })
            .eq('payment_intent_id', paymentIntent.id);

          console.log(`Order with payment_intent ${paymentIntent.id} marked as failed`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
