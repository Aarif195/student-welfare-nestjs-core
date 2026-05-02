import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class PaymentService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;

  constructor(
    private configService: ConfigService,
    private prisma: DatabaseService,
    private readonly httpService: HttpService,
  ) {
    const key = this.configService.get<string>('paystack.secretKey');
    if (!key) {
      throw new Error('PAYSTACK_SECRET_KEY is not defined in the environment');
    }
    this.secretKey = key;
  }


  // To start the payment process
  async initializeTransaction(amount: number, email: string, metadata: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/transaction/initialize`,
          {
            amount: Math.round(amount * 100),
            email,
            metadata,
          },
          {
            headers: {
              Authorization: `Bearer ${this.secretKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data.data;
    } catch (error) {
      throw new Error(`Paystack Init Error: ${error.response?.data?.message || error.message}`);
    }
  }

  // verifyWebhook
  // async verifyWebhook(signature: string, payload: Buffer) {
  //   const webhookSecret = this.configService.get<string>('stripe.webhookSecret');

  // if (!webhookSecret) {
  //     throw new Error('STRIPE_WEBHOOK_SECRET is missing from configuration');
  //   }

  //   try {
  //     return this.stripe.webhooks.constructEvent(
  //       payload,
  //       signature,
  //       webhookSecret,
  //     );
  //   } catch (err) {
  //     throw new Error(`Webhook Error: ${err.message}`);
  //   }
  // }

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