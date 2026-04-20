import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import Stripe from 'stripe';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashed: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashed);
};

export const generateToken = (jwtService: JwtService, id: number): string => {
  return jwtService.sign({ id });
};

export const verifyPayment = async (reference: string, stripe: Stripe): Promise<boolean> => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(reference);
    return paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_payment_method';
  } catch (error) {
    return false;
  }
};

// generate otp 
export const generateOTP = (length: number): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max).toString();
};
