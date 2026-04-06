import { DatabaseService } from '@/database/database.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

constructor(private configService: ConfigService,
    private prisma: DatabaseService,
) {
  const secretKey = this.configService.get<string>('stripe.secretKey');
  
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is missing from config');
  }

  this.stripe = new Stripe(secretKey, {
    apiVersion: '2026-03-25.dahlia',
  });
}


// To start the payment process
async createPaymentIntent(amount: number, metadata: { roomId: string, studentId: string }) {
  try {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    };
  } catch (error) {
    throw new Error(`Stripe Intent Error: ${error.message}`);
  }
}

// verifyWebhook
async verifyWebhook(signature: string, payload: Buffer) {
  const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
  
if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is missing from configuration');
  }

  try {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  } catch (err) {
    throw new Error(`Webhook Error: ${err.message}`);
  }
}

// payment process logic
async handlePaymentIntentSucceeded(paymentIntent: any) {
  const { roomId, studentId } = paymentIntent.metadata;
  const reference = paymentIntent.id;

  await this.prisma.payment.updateMany({
    where: { reference: reference },
    data: { payment_status: 'success', paid_at: new Date() },
  });

  console.log(`Verified: Room ${roomId} paid by Student ${studentId} ${reference} `);
}


}