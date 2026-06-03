import { Controller, Post, Body, Req, Res, HttpStatus, BadRequestException, RawBodyRequest } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

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


  @Post('create-intent')
  @Roles(Role.student)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize Paystack Payment' })
  @ApiOkResponse({ description: 'Payment initialized successfully', type: PaymentIntentResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async createIntent(
    @GetUser() user: { id: number },
    @Body() body: CreatePaymentIntentDto,
  ) {
    console.log("user", user)
    console.log("body", body)
    try {
      const data = await this.paymentService.initializeTransaction(body.amount, body.email, {
        roomId: body.roomId,
        studentId: user.id.toString(),
      });
      return { success: true, message: 'Payment initialized', data };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Route for Paystack to confirm payment success
  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Paystack Webhook Listener' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response
  ) {
    const signature = req.headers['x-paystack-signature'] as string;

    if (!req.rawBody) {
      return res.status(HttpStatus.BAD_REQUEST).send('Missing raw body');
    }

    const isValid = this.paymentService.verifyWebhookSignature(signature, req.rawBody);

    if (!isValid) {
      return res.status(HttpStatus.BAD_REQUEST).send('Invalid Signature');
    }

    await this.paymentService.handleWebhookEvent(req.body);

    return res.status(HttpStatus.OK).send('Webhook Received');
  }

  await this.paymentService.handleWebhookEvent(req.body);
  
  return res.status(HttpStatus.OK).send('Webhook Received');
}


}



