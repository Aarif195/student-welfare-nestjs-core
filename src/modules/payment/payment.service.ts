import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DatabaseService } from '@/database/database.service';
import * as crypto from 'crypto';

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
 verifyWebhookSignature(signature: string, rawBody: Buffer): boolean {
  const hash = crypto
    .createHmac('sha512', this.secretKey)
    .update(rawBody) 
    .digest('hex');
  return hash === signature;
}

async handleWebhookEvent(event: any) {
  if (event.event === 'charge.success') {
    const { reference, metadata } = event.data;
    
    // Update payment status in database
    await this.prisma.payment.updateMany({
      where: { reference: reference },
      data: { 
        payment_status: 'success', 
        paid_at: new Date(),
        payment_method: event.data.channel 
      },
    });

    console.log(`Payment successful for Room: ${metadata.roomId}`);
  }
}

}