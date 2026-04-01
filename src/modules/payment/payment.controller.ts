import { Controller, Post, Body, Req, Res, HttpStatus, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreatePaymentIntentDto, PaymentIntentResponseDto } from './dto/payment.dto';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';

import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Public } from '@/common/decorators/public.decorator';


@Controller('payment')
@ApiTags('Payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  // Route for Frontend to start the payment
  @Post('create-intent')
  @Roles(Role.student)
  @ApiOperation({ summary: 'Create a Stripe Payment Intent' })
  @ApiOkResponse({ description: 'Intent created successfully', type: PaymentIntentResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async createIntent(
    @GetUser() user: { id: number },
    @Body() body: CreatePaymentIntentDto,
  ) {
    try {
      const data = await this.paymentService.createPaymentIntent(body.amount, {
        roomId: body.roomId,
        studentId: user.id.toString(),
      });
      return { success: true, message: 'Payment intent created', data };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Route for Stripe to confirm payment success
  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe Webhook Listener' })
  async handleWebhook(@Req() req: Request & { rawBody: Buffer }, @Res() res: Response) {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = req.rawBody;

    try {
      const event = await this.paymentService.verifyWebhook(signature, rawBody);

      if (event.type === 'payment_intent.succeeded') {
        await this.paymentService.handlePaymentIntentSucceeded(event.data.object);
      }

      return res.status(HttpStatus.OK).send();
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
    }
  }
}



